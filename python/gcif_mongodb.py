"""
    A sample connnection for MongoDB to store fielddef_gcif (indicator_template.csv) and
    members_recent_gcif (recent_gcif.csv) collections
"""

import sys
import csv
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
        print "Successfully connected to MongoDB"

    except ConnectionFailure, err:
        sys.stderr.write("Could not connect to MongoDB: %s" % err)
        sys.exit(1)

    # Get a Database handle to a database named "gcif"
    db_handle = connection[db_name]

    # Check the connection
    assert db_handle.connection == connection
    print "Database handle OK"

    return db_handle



# function: getDocs
# @description: makes a list of embedded documents for the gcif data
# @pre-condition: valid csv files
# @input:
#   schemacsv - a csv with "name", "indicator_id", "type", and "category"
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

        for inds, schemarow in enumerate(schemareader):
            schemadict[schemarow[iname]] = {"indicator_id": schemarow[iindicator_id]
                                      , "type": schemarow[itype]
                                      , "category": schemarow[icategory]}

    ### test the schemadict
    # print schemadict["Annual population change _65"]

    docs = []

    #*# open the data csv
    with open(datacsv, 'rb') as datafile:
        #Instantiate a csv reader
        datareader = csv.reader(datafile, delimiter=',')
        #Read in first row of headers
        dataheaders = datareader.next()

        # create a document for each city (255 total)
        for indd, datarow in enumerate(datareader):

            doc = {}

            #loop over each entry
            for indc, cell in enumerate(datarow):

                # get the indicator name, get out the schema values, and push in the data
                indicator_name = dataheaders[indc]
                indicator_dict = schemadict[indicator_name]
                indicator_dict["value"] = datarow[indc]

                # add a new entry
                doc[dataheaders[indc]] = indicator_dict

            docs.append(doc)

    print (docs[0]["Commercial/industrial assessment as a percentage of total assessment_61"])

    return 0


def main():
    # gcifname = "gcif"
    # gcifhost = "localhost"
    #
    # gcif_handle = getdbhandle(gcifhost, gcifname)
    # gcif_handle.testcollection.insert(testdoc, safe=True)

    schemacsv = "/home/jvwong/Documents/GCIF/data/member/workbook/recent/indicator_template.csv"
    datacsv = "/home/jvwong/Documents/GCIF/data/member/cleaned/recent/recent_gcif.csv"
    docs = getDocs(schemacsv, datacsv)
    print docs


if __name__ == "__main__":
    main()