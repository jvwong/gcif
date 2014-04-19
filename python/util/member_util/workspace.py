"""
    Workspace for member GCIF data
"""

import sys
import csv
import re
import copy

import json

from pymongo import Connection
from pymongo.errors import ConnectionFailure
import pymongo

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



# function: getThemeCounts
# @description: generate csv of the number of core indicators per theme
# @pre-condition: valid monogo collection for schema
# @input:
#   db_handle - a mongo db handle to collection "schema_gcif"
# @output:
#   csvout - a csv of the counts for each theme
def getThemeCounts(db_handle):

    csvout = []

    # A list of indicator categories
    themes = sorted(db_handle.schema_gcif.find({"type": "core"}).distinct("theme"))

    #append a header row
    csvout.append(themes)

    counts = []
    #count up the indicators for each theme in order of appearance
    for theme in themes:
        # get out the core documents for each theme
        counts.append(db_handle.schema_gcif.find({"type": "core", "theme": theme}).count())

    # print counts
    csvout.append(counts)

    return csvout


def main():

    #*** open the gcif database
    gcifname = "gcif"
    gcifhost = "localhost"
    gcif_handle = getdbhandle(gcifhost, gcifname)

    ### ******************************** DATABASE OPERATIONS *****************************************************
    #
    # ****************** prepare gcif collections
    tcounts = getThemeCounts(gcif_handle)
    # print tcounts

    with open('core_theme_counts.csv', 'wb') as ffoutcatcount:
        writer = csv.writer(ffoutcatcount)
        writer.writerows(tcounts)


if __name__ == "__main__":
    main()