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
# @description: makes a list of embedded documents for the gcif data
# @pre-condition: valid csv files
# @input:
#   schemacsv - a csv with "name", "indicator_id", "type", "category", "data_type" (Javascript)
#   datacsv - a csv with the city data and headers matching "names" in schema
# @output:
#   docs - a list of documents ready for pymongo insert
def getDocs(schemacsv, datacsv):

    #This is a dict with keys that are precisely indicator names/headers in data
    schemadict = {}

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
        icategory = schemaheaders.index('category')
        idata_type = schemaheaders.index('data_type')

        for inds, schemarow in enumerate(schemareader):
            schemadict[schemarow[iname]] = {"indicator_id": schemarow[iindicator_id]
                                            , "type": schemarow[itype]
                                            , "category": schemarow[icategory]
                                            , "data_type": schemarow[idata_type]}

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

                # *************** embedded output
                # get the indicator name, get out the schema values, and push in the data
                # indicator_name = dataheaders[indc]
                # indicator_dict = schemadict[indicator_name]
                # indicator_dict["value"] = datarow[indc]
                # doc[headname] = indicator_dict

                # add a new entry for each header name
                # Get the header name. Gotta replace any dots (.) with comma
                headname = re.sub('\.', ',', dataheaders[indc])

                # *************** simple output
                #doc[headname] = datarow[indc]

            doclist.append(copy.deepcopy(doc))

    return doclist


# function: getSchema
# @description: makes a list of the indicators schema
# @pre-condition: valid csv file
# @input:
#   schemacsv - a csv with "name", "indicator_id", "type", "category", and "Number" (Javascript)
# @output:
#   docs - a list of documents ready for pymongo insert
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
        icategory = schemaheaders.index('category')
        idata_type = schemaheaders.index('data_type')


        for ind, schemarow in enumerate(schemareader):

            schemadoc = {"name": schemarow[iname]
                       , "indicator_id": schemarow[iindicator_id]
                       , "type": schemarow[itype]
                       , "category": schemarow[icategory]
                       , "data_type": schemarow[idata_type]}

            doclist.append(copy.deepcopy(schemadoc))

    return doclist



# function: getCoreList
# @description: makes a csv chart of the cities and core indicator values
# @pre-condition: valid mongo collections
# @input:
#   dbhandle - the pymongo data base handle
# @output:
#   coreOut - a csv list of cities and core indicator values
def getCoreList(dbhandle):

    # A list to store the csv
    coreOut = []

    # Get the document collections for the schema and data
    schema = dbhandle.schema_gcif.find({"type": "core"}) #all core
    cities = dbhandle.members_recent_gcif_simple.find()

    # Write out the header row
    corenames = []
    corenames = [core.get("name").encode('UTF-8') for core in schema]
    corenames.insert(0, 'CityUniqueID_')
    corenames.insert(0, 'CityName')
    coreOut.append(corenames)

    ###loop over each city (255) and extract that indicator
    for city in cities:

        citydata = []

        ### loop over the core indicator names (39)
        for corename in corenames:
            citydata.append((city[corename]).encode('UTF-8'))

        coreOut.append(citydata)

    return coreOut



# function: getCoreJson
# @description: gets a json list of the cities and core indicator values
# @pre-condition: valid mongo collections
# @input:
#   dbhandle - the pymongo data base handle
# @output:
#   coreOut - a json list of cities and core indicator values
def getCoreJson(dbhandle):

    # A list to store the csv
    coreOut = []

    # Get the document collections for the schema and data
    schema = dbhandle.schema_gcif.find({"type": "core"}) #all core
    cities = dbhandle.members_recent_gcif_simple.find()

    # Write out the core indicator list
    corenames = [core.get("name").encode('UTF-8') for core in schema]
    corenames.insert(0, 'CityUniqueID_')
    corenames.insert(0, 'CityName')

    ###loop over each city (255)
    for city in cities:

        citydoc = {}

        ### loop over the core indicator names (39)
        for corename in corenames:
            citydoc[corename] = (city[corename]).encode('UTF-8')

        coreOut.append(copy.deepcopy(citydoc))

    return coreOut



# function: getCoreCounts
# @description: gets a csv of the cities and their counts under each category
# @pre-condition: valid mongo collections
# @input:
#   dbhandle - the pymongo data base handle
# @output:
#   coreOut - a csv of cities (255) and indicator counts for each category
def getCoreJson(dbhandle):

    # A list to store the csv
    coreOut = []

    # Get the document collections for the schema and data
    schema = dbhandle.schema_gcif.find({"type": "core"}) #all core
    cities = dbhandle.members_recent_gcif_simple.find()

    # Write out the core indicator list
    corenames = [core.get("name").encode('UTF-8') for core in schema]
    corenames.insert(0, 'CityUniqueID_')
    corenames.insert(0, 'CityName')

    ###loop over each city (255)
    for city in cities:

        citydoc = {}

        ### loop over the core indicator names (39)
        for corename in corenames:
            citydoc[corename] = (city[corename]).encode('UTF-8')

        coreOut.append(copy.deepcopy(citydoc))

    return coreOut




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
    categories = ["economy", "education", "energy", "fire and emergency", "finance", "governance", "health", "safety"
                , "technology and innovation", "transportation", "urban planning, shelter and environment"
                , "waste management", "wastewater", "water and sanitation"]

    # Put in a header
    catcounts.append(["CityName", "CityUniqueID_", "economy", "education", "energy", "fire and emergency", "finance"
                , "governance", "health", "safety", "technology and innovation", "transportation"
                , "urban planning, shelter and environment", "waste management", "wastewater", "water and sanitation"
                , "all"])

    # get the city data
    cities = dbhandle.members_recent_gcif_simple.find()

    # loop over each city
    for city in cities:

        #Add some row indicators for the City
        citycatcounts = [city.get('CityName').encode('UTF-8'), city.get('CityUniqueID_').encode('UTF-8')]

        total = 0

        # get a list of indicators for each category
        for indc, category in enumerate(categories):

            #reset the count for this category
            ccount = 0
            indicators = dbhandle.schema_gcif.find({"type": "core", "category": category})

            # loop over each of the indicator documents in the list
            for indicatordoc in indicators:

                indicator = indicatordoc.get("name")
                #Generate a sum of counts for each indicator of the category
                if indicator and city.get(indicator) != "":
                    ccount += 1

            #store the count for this category
            total += ccount
            citycatcounts.append(ccount)

        # add the total
        citycatcounts.append(total)
        #store the counts for this city
        catcounts.append(citycatcounts)

    return catcounts




def main():

    #*** open the gcif database
    gcifname = "gcif"
    gcifhost = "localhost"
    gcif_handle = getdbhandle(gcifhost, gcifname)

    # result = gcif_handle.members_recent_gcif_simple.find().limit(1)
    # for r in result:
    #     print r.get("Employment percentage change based on the last 5 years_66") != ""
    #     print r.get("Country's GDP (US$)_67") != ""

    # ###******** prepare gcif collections
    # schemacsv = "/home/jvwong/Documents/GCIF/data/member/workbook/recent/indicator_template.csv"
    # datacsv = "/home/jvwong/Documents/GCIF/data/member/cleaned/recent/recent_gcif.csv"
    # dlist = getDocs(schemacsv, datacsv)
    # slist = getSchemaDoc(schemacsv)
    ##insert
    # gcif_handle.members_recent_gcif_simple.insert(dlist, safe=True)
    # gcif_handle.members_recent_gcif.insert(dlist, safe=True)
    # gcif_handle.schema_gcif.insert(slist, safe=True)


    ## ************** Generate a json list of cities and it's core indicators
    # foutcore = '/home/jvwong/Projects/GCIF/python/member_core.json'
    # corejson = getCoreJson(gcif_handle)
    #
    # with open(foutcore, 'wb') as ffoutcore:
    #     ffoutcore.write(json.dumps(corejson))


    ## **************  Generate a json list of categories and corresponding indicators
    # foutcat = '/home/jvwong/Projects/GCIF/python/category_indicators.json'
    # catlist = getCategoryLists(gcif_handle)
    # print json.dumps(catlist)
    #
    # with open(foutcat, 'wb') as ffoutcat:
    #     ffoutcat.write(json.dumps(catlist))



    ## ************** Generate a csv of cities and their per-category counts
    foutcat = '/home/jvwong/Projects/GCIF/data/category_counts.csv'
    catcounts = getCategoryCounts(gcif_handle)

    with open(foutcat, 'wb') as ffoutcatcount:
        writer = csv.writer(ffoutcatcount)
        writer.writerows(catcounts)


if __name__ == "__main__":
    main()