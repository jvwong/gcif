"""
    A sample connnection for MongoDB to update the gcif combined collection
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




# function: updateCoreKeys
# @description: checks each document for the core indicator keys and inserts the key if missing
# @pre-condition: valid mongo gcif collections
# @input:
#   dbhandle - the pymongo data base handle
# @output:

def updateCoreKeys(dbhandle):

    # Get the document collections for the schema and data
    citydocs = dbhandle.gcif_combined.find()
    citydocsls = [doc for doc in citydocs]

    coredocs = dbhandle.performance_indicators.find({"core": 1})
    coredocsls = [doc for doc in coredocs]

    for indcity, citydoc in enumerate(citydocsls):

        for indcore, coredoc in enumerate(coredocsls):
            #Check to see if key exists
            current_indicator = coredoc.get("indicator")
            if citydoc.get(current_indicator) is None:
                indicator = re.sub('\.', ',', current_indicator.encode('UTF-8'))
                dbhandle.gcif_combined.update({"_id": citydoc.get("_id")},
                                              {"$set": {indicator: ""}})


def checkCoreKeys(dbhandle):

    # Get the document collections for the schema and data
    citydocs = dbhandle.gcif_combined.find()
    citydocsls = [doc for doc in citydocs]

    coredocs = dbhandle.performance_indicators.find({"core": 1})
    coredocsls = [doc for doc in coredocs]

    for indcity, citydoc in enumerate(citydocsls):

        missing = 0
        print citydoc.get("CityName").encode('UTF-8')
        for indcore, coredoc in enumerate(coredocsls):
            #Check to see if key exists
            current_indicator = coredoc.get("indicator")
            if citydoc.get(current_indicator) is None:
                print current_indicator
                missing += 1

        print missing











def main():

    #*** open the gcif database
    gcifname = "gcif"
    gcifhost = "localhost"
    gcif_handle = getdbhandle(gcifhost, gcifname)

    #### ******************************** gcif DATABASE OPERATIONS ***************************************************
    checkCoreKeys(gcif_handle)

    #### ******************************** gcif DATABASE OPERATIONS ***************************************************


if __name__ == "__main__":
    main()