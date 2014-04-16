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

    corejson = {}

    coreindicators = db_handle.schema_gcif.find({"type": "core"})

    # open the file
    with open(fcsv, 'rb') as csvfile:
        csvreader = csv.reader(csvfile, delimiter=',')

        #Read in first row of headers
        header = csvreader.next()

        for ind, core in enumerate(coreindicators):
            name = ((core.get("name")).encode('UTF-8')).split("_")[0]

            ##Some stupid shit ass replacements
            if name == "Percentage of female population enrolled in schools":
                name = "Percentage of female school-aged population enrolled in schools"

            #The wrong units were stated
            elif name == "Total electrical use per capita (kWh/year)":
                name = "Total electrical use per capita (kilowatt/hr)"

            #plural
            elif name == "Debt service ratio (debt service expenditures as a percent of a municipality's own-source revenue)":
                name = "Debt service ratio (debt service expenditure as a percent of a municipality's own-source revenue)"

            #"the"
            elif name == "Percentage of the city's solid waste that is recycled":
                name = "Percentage of city's solid waste that is recycled"

            #
            elif name == "City unemployment rate":
                name = "Annual average unemployment rate"

            # print "name: %s" % name

            for indr, row in enumerate(csvreader):

                if row[0].strip() == name.strip():
                    # print "match: %s --- %s" % (row[0].strip(), name.strip())
                    # add the database name with the sample "result" value
                    corejson[name] = row[1].strip()
                    continue

            # print "\n"

            csvfile.seek(0)

        ###add the city name
        for indr, row in enumerate(csvreader):
            if row[0].strip() == "CityName":
                corejson["CityName"] = row[1].strip()

    return corejson




def main():

    #*** open the gcif database
    gcifname = "gcif"
    gcifhost = "localhost"
    gcif_handle = getdbhandle(gcifhost, gcifname)

    ### ******************************** DATABASE OPERATIONS *****************************************************
    #
    # ****************** prepare gcif collections
    # schemacsv = "/home/jvwong/Documents/GCIF/data/member/workbook/recent/indicator_template.csv"
    # datacsv = "/home/jvwong/Documents/GCIF/data/member/cleaned/recent/recent_gcif.csv"
    # dlist = getDocs(schemacsv, datacsv)
    # slist = getSchemaDoc(schemacsv)
    # #insert
    # gcif_handle.members_recent_gcif_simple.insert(dlist, safe=True)
    # gcif_handle.members_recent_gcif.insert(dlist, safe=True)
    # gcif_handle.schema_gcif.insert(slist, safe=True)


    # ### ******************************** DOCUMENT GENERATION OPERATIONS ******************************************
    # ### *********** Align headers for non members, and insert into collection nonmembers_gcif **********************
    # ### *** open the gcif database
    # files = ['/home/jvwong/Documents/GCIF/data/non_member/cleaned/london_gcif.csv',
    #          '/home/jvwong/Documents/GCIF/data/non_member/cleaned/windsor_gcif.csv',
    #          '/home/jvwong/Documents/GCIF/data/non_member/cleaned/greater_sudbury_gcif.csv',
    #          '/home/jvwong/Documents/GCIF/data/non_member/cleaned/saultstemarie_gcif.csv',
    #          '/home/jvwong/Documents/GCIF/data/non_member/cleaned/vilnius_gcif.csv',
    #          '/home/jvwong/Documents/GCIF/data/non_member/cleaned/prague_gcif.csv',
    #          '/home/jvwong/Documents/GCIF/data/non_member/cleaned/brno_gcif.csv',
    #          '/home/jvwong/Documents/GCIF/data/non_member/cleaned/ostrava_gcif.csv']
    #
    # for file in files:
    #     jsonout = alignHeaders(gcif_handle, file)
    #     gcif_handle.nonmembers_gcif_simple.insert(jsonout, safe=True)
    # #
    # #### add some bogus "CityUniqueID_"
    # citynames = ["LONDON", "SAULT STE MARIE", "GREATER SUDBURY", "WINDSOR", "VILNIUS", "BRNO", "OSTRAVA", "PRAGUE"]
    # ids       = ["nm001", "nm002", "nm003", "nm004", "nm005", "nm006", "nm007", "nm008"]
    #
    # # for ind, city in enumerate(citynames):
    # #     gcif_handle.nonmembers_gcif_simple.update({"CityName": city},{"$set": {"CityUniqueID_": ids[ind]}})
    #
    # found = 0
    # for city in citynames:
    #     result = gcif_handle.nonmembers_gcif_simple.find_one({"CityName": city})
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