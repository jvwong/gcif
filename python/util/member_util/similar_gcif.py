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



# function: countThemes
# @description: generate csv of the number of core indicators per theme
# @pre-condition: valid monogo collection for schema
# @input:
#   db_handle - a mongo db handle to collection "schema_gcif"
# @output:
#   csvout - a csv of the counts for each theme
def countThemes(db_handle):

    csvout = []

    # A list of indicator categories
    themes = sorted(db_handle.performance_indicators_gcif.find({"core": 1}).distinct("theme"))

    #append a header row
    csvout.append(themes)

    counts = []
    #count up the indicators for each theme in order of appearance
    for theme in themes:
        # get out the core documents for each theme
        counts.append(db_handle.performance_indicators_gcif.find({"core": 1, "theme": theme}).count())
    #
    # # print counts
    csvout.append(counts)

    return csvout



# function: getTopIndicators
# @description: retrieve indicators for themes most often reported (most abundant) in member cities
# @pre-condition: valid data base collection of indicators
# @input:
#   db_handle - a valid mongo db handle with collection for performance indicators (performance_indicators_gcif)
# @output:
#   indicatorlist - list of json documents for each indicator of interest
def getTopIndicators(db_handle):

    # A list of indicators from the most abundant themes
    abundanttheme = ["education", "finance", "health", "safety", "urban planning"]

    # The collection of indicators
    indicators = db_handle.performance_indicators_gcif.find({"core": 1})

    indlist = [{"indicator": indicator.get("indicator"), "theme": indicator.get("theme")} for indicator in indicators
               if indicator.get("theme") in abundanttheme]

    return indlist




def main():

    #*** open the gcif database
    gcifname = "gcif"
    gcifhost = "localhost"
    gcif_handle = getdbhandle(gcifhost, gcifname)

    ### ******************************** COLLECTION OPERATIONS *****************************************************
    #
    # ****************** prepare gcif collections
    # tcounts = countThemes(gcif_handle)
    #
    # with open('core_theme_counts.csv', 'wb') as ffoutcatcount:
    #     writer = csv.writer(ffoutcatcount)
    #     writer.writerows(tcounts)

    ### **************** Top Indicators, Themes, and Reporting Cities
    # abundant = getTopIndicators(gcif_handle)
    # with open('abundant_themes.json', 'wb') as fout:
    #     fout.write(json.dumps(abundant))


if __name__ == "__main__":
    main()