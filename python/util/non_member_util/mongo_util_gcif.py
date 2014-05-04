"""
    A sample connnection for MongoDB to store fielddef_gcif (indicator_template.csv) and
    members_recent_gcif (recent_gcif.csv) collections
"""

import sys
import csv
import re
import copy

import json

from pymongo import Connection
from pymongo.errors import ConnectionFailure


# function: getdbhandle
# @description: Takes the host and database name and returns a valid handle
# @pre-condition: a valid install of mongo
# @input:
#   hostname - IP of computer where mongo instance exists
#   db_name - mongo database name
# @output:
#   db_handle - a valid handle to the database db_name
def getdbhandle(hostname="localhost", db_name="test"):

    try:
        connection = Connection(host=hostname, port=27017)
        # print "Successfully connected to MongoDB"

    except ConnectionFailure, err:
        sys.stderr.write("Could not connect to MongoDB: %s" % err)
        sys.exit(1)

    # Get a Database handle to a database named "gcif"
    db_handle = connection[db_name]

    # Check the connection
    assert db_handle.connection == connection
    # print "Database handle OK"

    return db_handle



# function: getDocs
# @description: makes a list of documents for gcif data
# @pre-condition: valid csv files
# @input:
#   datacsv - a csv with the city data and headers matching "names" in schema
# @output:
#   docs - a list of documents ready for pymongo insert
def getDocs(datacsv):

    #*# open the data csv
    with open(datacsv, 'rb') as datafile:

        #The output
        doclist = []

        #Instantiate a csv reader
        datareader = csv.reader(datafile, delimiter=',')
        #Read in first row of headers
        dataheaders = datareader.next()

        # create a document for each city (255 total)
        for indd, datarow in enumerate(datareader):

            doc = {}
            #loop over each entry
            for indc, cell in enumerate(datarow):

                # add a new entry for each header name
                # Get the header name. Gotta replace any dots (.) with comma
                headname = re.sub('\.', ',', dataheaders[indc])

                # *************** simple output
                doc[headname] = datarow[indc]

            doclist.append(copy.deepcopy(doc))

    return doclist



# function: getSchema
# @description: makes a list of the indicators schema
# @pre-condition: valid csv file
# @input:
# schemacsv - a csv with "name", "indicator_id", "type", "category", and "Number" (Javascript)
# @output:
# docs - a list of documents ready for pymongo insert
def getSchemaDoc(schemacsv):

    doclist = []

    # open the schema csv and format this for retrieval below
    with open(schemacsv, 'rb') as schemafile:
        #Instantiate a csv reader
        schemareader = csv.reader(schemafile, delimiter=',')
        #Read in first row of headers
        schemaheaders = schemareader.next()

        #Get index of the headers (name, indicator_id, type, category)
        iname = schemaheaders.index('name')
        iindicator_id = schemaheaders.index('indicator_id')
        itype = schemaheaders.index('type')
        icategory = schemaheaders.index('theme')
        idata_type = schemaheaders.index('data_type')


        for ind, schemarow in enumerate(schemareader):

            schemadoc = {"name": schemarow[iname]
                       , "indicator_id": schemarow[iindicator_id]
                       , "type": schemarow[itype]
                       , "theme": schemarow[icategory]
                       , "data_type": schemarow[idata_type]}

            doclist.append(copy.deepcopy(schemadoc))

    return doclist



# function: getCategoryIndicators
# @description: makes a json of the core performance categories and their respective indicators
# @pre-condition: valid db_handle and collection of indicator schema
# @input:
#   db_handle - a handle to a mongo db database
# @output:
#   cats_indicators - a json of the form {"category_i": [ind_i1, ..., ind_in],..., "category_m": [ind_m1, ..., ind_mn]}
def getCategoryIndicators(db_handle):

    cats_indicators = {}

    categories = ["economy", "education", "energy", "environment", "finance", "fire and emergency response"
                , "governance", "health", "safety", "solid waste", "telecommunication and innovation", "transportation"
                , "shelter", "urban planning", "wastewater", "water and sanitation"]

    for category in categories:
        indslist = []

        indicators = db_handle.schema_gcif.find({"type": "core", "category": category})

        for indicator in indicators:
            indslist.append((indicator.get("name")).encode('UTF-8'))

        cats_indicators[category] = indslist

    return cats_indicators


# function: getCoreJson
# @description: outputs json of the cities (key = CityUniqueID_) and data for core indicators
# @pre-condition: valid mongo collections
# @input:
#   dbhandle - the pymongo data base handle
# @output:
#   coreOut - a json of { CityUniqueID_: [{core_indicator1: val1,...,core_indicatorN: valN}] }
def getCoreJson(dbhandle):

    #Output as json
    cityjson = {}

    # Get the document collections for the schema and data
    schema = dbhandle.schema_gcif.find({"type": "core"}) #all core
    cities = dbhandle.nonmembers_gcif_simple.find()

    # Write out the core indicator list
    corenames = [core.get("name").encode('UTF-8') for core in schema]
    corenames.insert(0, 'CityUniqueID_')
    corenames.insert(0, 'CityName')

    ###loop over each city (255)
    for city in cities:

        # print city

        #store the embedded json of data here
        citydata = {}

        ### loop over the core indicator names (39)
        for corename in corenames:
            # print "corename: %s ----------- split name: %s" % (corename, corename.split("_")[0])

            if corename != "CityUniqueID_":
                corename = corename.split("_")[0]

            ##Some stupid shit ass replacements
            if corename == "Percentage of female population enrolled in schools":
                corename = "Percentage of female school-aged population enrolled in schools"

            #The wrong units were stated
            elif corename == "Total electrical use per capita (kWh/year)":
                corename = "Total electrical use per capita (kilowatt/hr)"

            #plural
            elif corename == "Debt service ratio (debt service expenditures as a percent of a municipality's own-source revenue)":
                corename = "Debt service ratio (debt service expenditure as a percent of a municipality's own-source revenue)"

            #"the"
            elif corename == "Percentage of the city's solid waste that is recycled":
                corename = "Percentage of city's solid waste that is recycled"

            #
            elif corename == "City unemployment rate":
                corename = "Annual average unemployment rate"

            citydata[corename] = (city[corename]).encode('UTF-8')

        cityjson[city["CityUniqueID_"]] = copy.deepcopy(citydata)

    return cityjson



# function: getCategoryCounts
# @description: generates a csv of category counts for each set of city core indicators
# @pre-condition: valid mongo collections
# @input:
#   dbhandle - the pymongo data base handle
# @output:
#   coreOut - a dict of indicators for each category
def getCategoryCounts(dbhandle):

    # A dict to store the categories (key) and indicators (values)
    catcounts = []

    # A list of indicator categories
    categories = ["economy", "education", "energy", "environment", "finance", "fire and emergency response"
                , "governance", "health", "safety", "solid waste", "telecommunication and innovation", "transportation"
                , "shelter", "urban planning", "wastewater", "water and sanitation"]

    # Put in a header
    catcounts.append(["CityName", "CityUniqueID_", "economy", "education", "energy", "environment", "finance"
                , "fire and emergency response", "governance", "health", "safety", "solid waste"
                , "telecommunication and innovation", "transportation", "shelter", "urban planning", "wastewater"
                , "water and sanitation", "all"])

    # get the city data
    cities = dbhandle.nonmembers_gcif_simple.find()

    # loop over each city
    for city in cities:

        #Add some row indicators for the City
        citycatcounts = [city.get('CityName').encode('UTF-8'), city.get('CityUniqueID_').encode('UTF-8')]
        # print city

        total = 0

        # get a list of indicators for each category
        for indc, category in enumerate(categories):

            #reset the count for this category
            ccount = 0
            indicators = dbhandle.schema_gcif.find({"type": "core", "category": category})

            # loop over each of the indicator documents in the list
            for indicatordoc in indicators:

                indicator = (indicatordoc.get("name")).split("_")[0]

                #Generate a sum of counts for each indicator of the category
                if indicator and (city.get(indicator) != ""):
                    ccount += 1

            #store the count for this category
            total += ccount
            citycatcounts.append(ccount)

        # add the total
        citycatcounts.append(total)
        #store the counts for this city
        catcounts.append(citycatcounts)

    return catcounts


# function: alignHeaders
# @description: compares the headers in a csv file against the "schema_gcif" collection (core)
# @pre-condition: valid schema_gcif collection and csv with [name, result, data year, and comments] fields
# @input:
#   db_handle - the database handle
#   fcsv - csv file path
# @output:
#   valid json of core indicators that can be pumped into a collection
def alignHeaders(db_handle, fcsv):


    added = []

    corejson = {}

    coreindicators = db_handle.schema_gcif.find({"type": "core"})

    goodnames = ["Percentage of female population enrolled in schools",
                 "Total electrical use per capita (kWh/year)",
                 "Debt service ratio (debt service expenditures as a percent of a municipality's own-source revenue)",
                 "Percentage of the city's solid waste that is recycled",
                 "City unemployment rate"]

    badnames = ["Percentage of female school-aged population enrolled in schools",
                "Total electrical use per capita (kilowatt/hr)",
                "Debt service ratio (debt service expenditure as a percent of a municipality's own-source revenue)",
                "Percentage of city's solid waste that is recycled",
                "Annual average unemployment rate"]

    isonames = ["Percentage of female school-aged population enrolled in schools",
                "Total residential electrical energy use per capita (kWh/year)",
                "Debt service ratio (debt service expenditure as a percent of a municipality's own-source revenue)",
                "Percentage of city's solid waste that is recycled",
                "City's unemployment rate"]


    gcif_replace = ["City unemployment rate",
                "Commercial/industrial assessment as a percentage of total assessment",
                "Student/teacher ratio",
                "Total electrical use per capita (kWh/year)",
                "PM10 Concentration",
                "Number of firefighters per 100,000 population",
                "Number of fire related deaths per 100,000 population",
                "Percentage of city population with regular solid waste collection",
                "Km of high capacity public transit system per 100,000 population",
                "Km of light passenger transit system per 100,000 population",
                "Annual number of public transit trips per capita",
                "Debt service ratio (debt service expenditures as a percent of a municipality's own-source revenue)",
                "Number of in-patient hospital beds per 100,000 population",
                "Number of physicians per 100,000 population",
                "Under age five mortality per 1,000 live births",
                "Number of police officers per 100,000 population",
                "Number of homicides per 100,000 population",
                "Percentage of the city's solid waste that is recycled",
                "Number of internet connections per 100,000 population",
                "Number of cell phone connections per 100,000 population",
                "Green area (hectares) per 100,000 population",
                "Percentage of female population enrolled in schools"]


    ISO_replace = ["City's unemployment rate",
                   "Assessed value of commercial and industrial properties as a percentage of total assessed value of all properties",
                   "Primary education student/teacher ratio",
                   "Total residential electrical energy use per capita (kWh/year)",
                   "Particulate Matter (PM10) concentration",
                   "Number of firefighters per 100 000 population",
                   "Number of fire related deaths per 100 000 population",
                   "Percentage of city population with regular solid waste collection (residential)",
                   "Kilometres of high capacity public transport system per 100 000 population",
                   "Kilometres of light passenger public transport system per 100 000 population",
                   "Annual number of public transport trips per capita",
                   "Debt service ratio (debt service expenditure as a percent of a municipality's own-source revenue)",
                   "Number of in-patient hospital beds per 100 000 population",
                   "Number of physicians per 100 000 population",
                   "Under age five mortality per 1000 live births",
                   "Number of police officers per 100 000 population",
                   "Number of homicides per 100 000 population",
                   "Percentage of city's solid waste that is recycled",
                   "Number of internet connections per 100 000 population",
                   "Number of cell phone connections per 100 000 population",
                   "Green area (hectares) per 100 000 population",
                   "Percentage of female school-aged population enrolled in schools"]

    # open the file
    with open(fcsv, 'rb') as csvfile:
        csvreader = csv.reader(csvfile, delimiter=',')

        #Read in first row of headers
        header = csvreader.next()

        #loop through all core indicator names
        for ind, core in enumerate(coreindicators):
            name = ((core.get("name")).encode('UTF-8')).split("_")[0]

            #replace the name if it's in the badlist
            if name in goodnames:
                name = badnames[goodnames.index(name)]

            for indr, row in enumerate(csvreader):
                if row[0].strip() == name.strip():

                    # swap out any bad names
                    if name in badnames:
                        name = isonames[badnames.index(name)]
                    # swap out any non-iso names
                    elif name in gcif_replace:
                        name = ISO_replace[gcif_replace.index(name)]

                    # add the database name with the sample "result" value
                    corejson[name] = row[1].strip()
                    added.append(name)
                    continue

            csvfile.seek(0)

        ###add the city name
        for indr, row in enumerate(csvreader):
            if row[0].strip() == "CityName":
                corejson["CityName"] = row[1].strip()


    # Get the performance indicator list to fill-in missing values
    pindicators_query = db_handle.performance_indicators.find({"core": 1})
    plist = [(p.get('indicator')).encode('UTF-8') for p in pindicators_query]
    for p in plist:
        if p not in added:
            header_safe = re.sub('\.', ',', p)
            corejson[header_safe] = ""

    return corejson




def main():
    #*** open the gcif database
    gcifname = "gcif"
    gcifhost = "localhost"
    gcif_handle = getdbhandle(gcifhost, gcifname)

    ### ******************************** DATABASE OPERATIONS *****************************************************
    #
    # ****************** prepare gcif collections
    # schemacsv = "/home/jvwong/Public/Documents/GCIF/data/standards/generic/indicator_template.csv"
    schemacsv = "/shared/Documents/GCIF/data/standards/generic/indicator_template.csv"
    slist = getSchemaDoc(schemacsv)
    gcif_handle.schema_gcif.insert(slist, safe=True)


    # ### ******************************** DOCUMENT GENERATION OPERATIONS ******************************************
    # ### *********** Align headers for non members, and insert into collection nonmembers_gcif **********************
    # ### *** open the gcif database

    # root = '/home/jvwong/Public/Documents/GCIF/data/datasets/non_member/cleaned/'
    root = '/shared/Documents/GCIF/data/datasets/non_member/cleaned/'
    files = ['london_gcif.csv', 'windsor_gcif.csv', 'greater_sudbury_gcif.csv', 'saultstemarie_gcif.csv',
             'vilnius_gcif.csv', 'prague_gcif.csv', 'brno_gcif.csv', 'ostrava_gcif.csv']

    for file in files:
        path = root + file
        jsonout = alignHeaders(gcif_handle, path)
        #
        gcif_handle.gcif_combined.insert(jsonout, safe=True)
        gcif_handle.nonmember_cities.insert(jsonout, safe=True)


    # #### add a Region field
    citynames = ["LONDON", "SAULT STE MARIE", "GREATER SUDBURY", "WINDSOR",
                 "VILNIUS", "BRNO", "OSTRAVA", "PRAGUE"]
    regions   = ["NORTH AMERICA", "NORTH AMERICA", "NORTH AMERICA", "NORTH AMERICA",
                 "EUROPE - CENTRAL ASIA", "EUROPE - CENTRAL ASIA", "EUROPE - CENTRAL ASIA", "EUROPE - CENTRAL ASIA"]

    for ind, city in enumerate(citynames):
        gcif_handle.gcif_combined.update({"CityName": city}, {"$set": {"Region": regions[ind]}})
        gcif_handle.nonmember_cities.update({"CityName": city}, {"$set": {"Region": regions[ind]}})

    # found = 0
    # for city in citynames:
    #     result = gcif_handle.nonmember_cities.find_one({"CityName": city})
    #     print result
    #     found += 1
    #
    # print found


    ### *** Data: Generate a json of cities and it's core indicators
    # foutcore = '/home/jvwong/Projects/gcif/webapp/public/assets/data/nonmember_core_byID.json'
    # corejson = getCoreJson(gcif_handle)
    #
    # with open(foutcore, 'wb') as ffoutcore:
    #     ffoutcore.write(json.dumps(corejson))

    ### *** Schema: Generate a json of core categories (keys) and their respective
    # indicators (value list)
    # foutcat = 'category_indicators.json'
    # catjson = getCategoryIndicators(gcif_handle)
    # #print catjson
    # #
    # with open(foutcat, 'wb') as ffoutcat:
    #     ffoutcat.write(json.dumps(catjson))

    ### *** Counts: Generate a csv of cities and their per-category counts
    # foutcat = 'nonmember_category_counts.csv'
    # catcounts = getCategoryCounts(gcif_handle)
    # print catcounts
    #
    #
    # with open(foutcat, 'wb') as ffoutcatcount:
    #     writer = csv.writer(ffoutcatcount)
    #     writer.writerows(catcounts)



if __name__ == "__main__":
    main()