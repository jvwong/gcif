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



# function: getCityDocs
# @description: makes a list of dicts for each city's indicators data. Here we clean and convert to ISO
# @input:
#   datacsv - a csv with the city data and headers matching profile and performance indicators
#           will have to make accomodations here between ISO and gcif headers
# @output:
#   docs - a list of dicts suitable for mongoDB insert
def getCityDocs(datacsv):

    #*# open the data csv
    with open(datacsv, 'rb') as datafile:

        #The output
        doclist = []

        #Instantiate a csv reader
        csvreader = csv.reader(datafile, delimiter=',')

        #Read in first row of headers and clean them up
        dirty_data_headers = csvreader.next()
        data_headers = [(d.split("_")[0]).strip() for d in dirty_data_headers]

        headers = []

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



        for h in data_headers:
            if re.match('(?:datayear)|(?:data year)|(?:comments)|(?:n/a)', h.lower()):
                continue
            elif h in gcif_replace:
                h = ISO_replace[gcif_replace.index(h)]

            headers.append(h)

        # create a document for each city (255 total)
        for indd, row in enumerate(csvreader):
            doc = {}

            #loop over each header
            for indh, header in enumerate(headers):

                # get the header index from the original data csv -- tricky
                if header in ISO_replace:
                    legacy_name = gcif_replace[ISO_replace.index(header)]
                    dataheader_index = data_headers.index(legacy_name)
                else:
                    dataheader_index = data_headers.index(header)

                # clean up dots [.] so it's BSON-compatible
                header_safe = re.sub('\.', ',', header)
                doc[header_safe] = row[dataheader_index]

            doclist.append(copy.deepcopy(doc))

    return doclist



# function: getThemeCounts
# @description: generates a csv of theme counts for each set of city core performance indicators
# @pre-condition: valid mongo collection "performance_indicators_gcif"
# @input:
#   dbhandle - the pymongo data base handle
# @output:
#   themecounts - a csv of indicator counts for each theme
def getThemeCounts(db_handle):

    # A dict to store the themes (key) and indicators (values)
    themecounts = []

    # A list of indicator themes
    themes = [theme.encode('UTF-8') for theme in sorted(db_handle.performance_indicators_gcif.find({"core": 1}).distinct("theme"))]

    headers = themes[0:]
    headers.insert(0, "CityUniqueID")
    headers.insert(0, "CityName")
    headers.append("all")

    themecounts.append(headers)

    ### get the city data
    cities = db_handle.member_gcif.find()

    # # loop over each city
    for city in cities:

        #Add some row indicators for the City
        citythemecounts = [city.get('CityName').encode('UTF-8'), city.get('CityUniqueID').encode('UTF-8')]

        total = 0

        # get a list of indicators for each theme
        for indc, theme in enumerate(themes):

            #reset the count for this theme
            ccount = 0
            indicators = db_handle.performance_indicators_gcif.find({"core": 1, "theme": theme})

            # loop over each of the indicator documents in the list
            for indicatordoc in indicators:
                indicator = indicatordoc.get("indicator").encode("UTF-8")

                #Generate a sum of counts for each indicator of the theme
                if indicator == "Fine Particulate Matter (PM2.5) concentration":
                    indicator = re.sub('\.', ',', indicator)

                if city.get(indicator) is not None and city.get(indicator) != "":
                    ccount += 1

            #store the count for this theme
            total += ccount
            citythemecounts.append(ccount)

        # add the total
        citythemecounts.append(total)
        #store the counts for this city
        themecounts.append(citythemecounts)

    return themecounts




def main():

    #*** open the gcif database
    gcifname = "gcif"
    gcifhost = "localhost"
    gcif_handle = getdbhandle(gcifhost, gcifname)

    ### ******************************** DOCUMENT GENERATION OPERATIONS ******************************************
    ### *** Data: Generate a json of cities and it's core indicators
    # foutcore = '/home/jvwong/Projects/GCIF/webapp/public/member_core_byID.json'
    # corejson = getCoreJson(gcif_handle)
    # with open(foutcore, 'wb') as ffoutcore:
    #     ffoutcore.write(json.dumps(corejson))

    ### *** Counts: Generate a csv of cities and their per-theme counts
    # fouttheme = 'member_theme_counts.csv'
    # themecounts = getThemeCounts(gcif_handle)
    #
    # with open(fouttheme, 'wb') as ffoutcatcount:
    #     writer = csv.writer(ffoutcatcount)
    #     writer.writerows(themecounts)
    ### ******************************** DOCUMENT GENERATION OPERATIONS ******************************************


    # ### ******************************** gcif DATABASE OPERATIONS *****************************************************
    # #
    # # ****************** prepare gcif collections
    # ********** chinese cities (gcif)
    root = "/home/jvwong/Public/Documents/GCIF/data/datasets/china/raw/"
    # root = "/shared/Documents/GCIF/data/datasets/china/raw/"
    china_data_csv = root + "china_gcif.csv"
    china_docs = getCityDocs(china_data_csv)

    # print china_docs

    gcif_handle.gcif_combined.insert(china_docs, safe=True)
    gcif_handle.chinese_cities.insert(china_docs, safe=True)
    # ### ******************************** gcif DATABASE OPERATIONS *****************************************************


if __name__ == "__main__":
    main()