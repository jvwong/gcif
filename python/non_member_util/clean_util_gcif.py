import csv
import re


# function: formatHeaders
# @description: A function that will take the headers from a csv file and output
# d3-friendly dict assignment statements (e.g. use in a forEach() javascript mapping function)
# @pre-condition: a valid csv file with headers
# @input:
#   file - path to the csv file with headers
# @output:
#   output - write to file
def formatHeaders(file):

    output = []

    # open the file
    with open(file, 'rb') as csvfile:

        #Instantiate a csv reader
        csvreader = csv.reader(csvfile, delimiter=',')

        #Read in first row of headers
        headers = csvreader.next()

        # loop through each header
        for header in headers:

            #Ignore comments and URLs
            if not re.match('(?:comment)|(?:n/a)', header.lower()):
                #Generate a custom string for assignment in d3.js; this should be paired with a DB schema
                # Check if it's a "DataYear_X" field
                if re.match('(?:datayear_)|(?:data year_)', header.lower()):
                    statement = 'd["%s"] = formatYear.parse(d["%s"])' % (header, header)

                # If it is a text column do not alter
                elif re.match('(?:country_)|(?:region_)|(?:cityname)|(?:climate type_)|(?:type of government)', header.lower()):
                    statement = 'd["%s"] = d["%s"]' % (header, header)

                #Assume the rest are Numbers
                else:
                    statement = 'd["%s"] = +d["%s"]' % (header, header)

                #default
                statement += ';\n'
                output.append(statement)

    jsText = 'parseData = function( d ){\n\n\ttry{\n'

    for o in output:
        jsText += '\t\t' + o


    jsText += "\t}\n\tcatch(err){\n\t\tconsole.error(err);\n\t}\n};"

    return jsText



# function: cleanCellsBudapest
# @description: A function that clears out
#   1) extra characters (e.g. units, commas, and N/A) from csv files
#   2) non - indicator characeters from name fields (numerator, denominator)
# @pre-condition: valid csv file path
# @input:
#   fname - csv file path
# @output:
#   mismatch - a cleaned csv file
def cleanCellsBudapest(fname):

    #Store the imported csv data as a list to output
    csvClean = []


    categories = ["Education", "Fire and Emergency Response", "Health", "Recreation", "Safety", "Solid Waste",
                  "Transportation", "Wastewater", "Water", "Energy", "Finance", "Governance", "Urban Planning",
                  "Civic Engagement", "Culture", "Economy", "Environment", "Shelter", "Social Equity",
                  "Technology and Innovation", "People", "Housing", "Economy", "Government", "Geography and Climate"]

    # open the file
    with open(fname, 'rb') as csvfile:

        #Instantiate a csv reader
        csvreader = csv.reader(csvfile, delimiter=',')

        #Read in first row of headers
        csvreader.next() #Budapest has a City name row
        header = csvreader.next()
        csvClean.append(header[0:4])

        #loop through rows
        for idxr, row in enumerate(csvreader):

            # skip category rows
            if row[0] in categories and row[1] == "" and row[2] == "" and row[3] == "":
                continue

            #loop through cells 0 - 2
            for idxc, cell in enumerate(row):

                stripped = cell

                if idxc == 0:
                    stripped = re.sub('[\:_]', "", stripped)
                    stripped = re.sub('numerator - ', "", stripped)
                    stripped = re.sub('denominator - ', "", stripped)

                elif idxc < 3:
                    stripped = re.sub('[\$,%]', "", stripped)
                    stripped = re.sub('N/A', "", stripped)
                    stripped = re.sub('#DIV/0!', "", stripped)

                # print stripped
                row[idxc] = stripped.strip()

            csvClean.append(row[0:4])

    return csvClean


# function: checkHeaders
# @description: A function that checks the header names for an exact match
# @pre-condition: valid csv file paths
# @input:
#   fname - test file path
#   fnameRed - reference file path
# @output:
#   mismatch - a list of column headers indices that do not match
def checkHeaders(fname, fnameRef):

    mismatch = []

    # open the file
    with open(fname, 'rb') as csvfile:

        with open(fnameRef, 'rb') as csvfileRef:

            csvreaderFile = csv.reader(csvfile, delimiter=',')
            csvreaderFileRef = csv.reader(csvfileRef, delimiter=',')

            #Read in first row of headers
            headerFile = csvreaderFile.next()
            headerFileRef = csvreaderFileRef.next()

            for idx, h in enumerate(headerFile):
                if not headerFileRef[idx] == h.strip():
                    print h
                    print headerFileRef[idx]
                    print "\n"
                    mismatch.append(idx)

    return mismatch



# function: cleanCellsCzech
# @description: A function that clears out
#   1) extra characters (e.g. units, commas, and N/A) from csv files
#   2) non - indicator characeters from name fields (numerator, denominator)
# @pre-condition: valid csv file path
# @input:
#   fname - csv file path
# @output:
#   mismatch - a cleaned csv file
def cleanCellsCzech(fname):

    #Store the imported csv data as a list to output
    csvClean = []


    categories = ["People", "Housing", "Economy", "Government", "Geography and Climate", "Education",
                  "Fire and Emergency Response", "Health", "Recreation", "Safety", "Solid Waste", "Transportation",
                  "Wastewater", "Water", "Energy", "Finance", "Governance", "Urban Planning", "Civic Engagement",
                  "Culture", "Environment", "Shelter", "Social Equity", "Technology and Innovation"]

    # open the file
    with open(fname, 'rb') as csvfile:

        #Instantiate a csv reader
        csvreader = csv.reader(csvfile, delimiter=',')

        #Read in first row of headers
        cityname = csvreader.next()
        header = csvreader.next()

        csvClean.append(header[0:4])
        csvClean.append(cityname)

        #loop through rows
        for idxr, row in enumerate(csvreader):

            # skip category rows
            if row[0].strip() in categories:
                continue

            #loop through cells 0 - 2
            for idxc, cell in enumerate(row):

                stripped = cell

                if idxc == 0:
                    stripped = re.sub('[\:_]', "", stripped)
                    stripped = re.sub('numerator - ', "", stripped)
                    stripped = re.sub('denominator - ', "", stripped)

                elif idxc < 3:
                    stripped = re.sub('[\$,%]', "", stripped)
                    stripped = re.sub('N/A', "", stripped)
                    stripped = re.sub('#DIV/0!', "", stripped)

                # print stripped
                row[idxc] = stripped.strip()

            csvClean.append(row[0:4])

    return csvClean


# function: cleanCellsSudbury
# @description: A function that clears out
#   1) extra characters (e.g. units, commas, and N/A) from csv files
#   2) non - indicator characeters from name fields (numerator, denominator)
# @pre-condition: valid csv file path
# @input:
#   fname - csv file path
# @output:
#   mismatch - a cleaned csv file
def cleanCellsSudbury(fname):

    #Store the imported csv data as a list to output
    csvClean = []


    categories = ["People", "Housing", "Economy", "Government", "Geography and Climate", "Education",
                  "Fire and Emergency Response", "Health", "Recreation", "Safety", "Solid Waste", "Transportation",
                  "Wastewater", "Water", "Energy", "Finance", "Governance", "Urban Planning", "Civic Engagement",
                  "Culture", "Environment", "Shelter", "Social Equity", "Technology and Innovation"]

    # open the file
    with open(fname, 'rb') as csvfile:

        #Instantiate a csv reader
        csvreader = csv.reader(csvfile, delimiter=',')

        #Read in first row of headers
        cityname = csvreader.next()
        header = csvreader.next()

        csvClean.append(header[0:4])
        csvClean.append(cityname)

        #loop through rows
        for idxr, row in enumerate(csvreader):

            # skip category rows
            if row[0].strip() in categories:
                continue

            #loop through cells 0 - 2
            for idxc, cell in enumerate(row):

                stripped = cell

                if idxc == 0:
                    stripped = re.sub('[\:_]', "", stripped)
                    stripped = re.sub('numerator - ', "", stripped)
                    stripped = re.sub('denominator - ', "", stripped)

                elif idxc < 3:
                    stripped = re.sub('[\$,%]', "", stripped)
                    stripped = re.sub('N/A', "", stripped)
                    stripped = re.sub('#DIV/0!', "", stripped)

                # print stripped
                row[idxc] = stripped.strip()

            csvClean.append(row[0:4])

    return csvClean


def main():

    ### *********** Cleaning of csv data ********************************

    ### Budapest
    # fin = '/home/jvwong/Documents/GCIF/data/non_member/raw/csv/Budapest_performance.csv'
    # fin = '/home/jvwong/Documents/GCIF/data/non_member/raw/csv/Budapest_profile.csv'
    # fout = fin.split('/')[-1]
    # clean = cleanCellsBudapest(fin)

    ### Czech (ostrava, prague, brno)
    # fin = '/home/jvwong/Documents/GCIF/data/non_member/raw/csv/brno.csv'
    # fin = '/home/jvwong/Documents/GCIF/data/non_member/raw/csv/ostrava.csv'
    fin = '/home/jvwong/Documents/GCIF/data/non_member/raw/csv/prague.csv'
    fout = fin.split('/')[-1]
    clean = cleanCellsCzech(fin)

    ### sudbury, london, saultstemarie, windsor, vilnius
    # fin = '/home/jvwong/Documents/GCIF/data/non_member/raw/csv/Greater_Sudbury_performance.csv'
    # fin = '/home/jvwong/Documents/GCIF/data/non_member/raw/csv/Greater_Sudbury_profile.csv'
    #
    # fout = fin.split('/')[-1]
    # clean = cleanCellsSudbury(fin)

    # print clean
    with open(fout, 'wb') as fout:
        writer = csv.writer(fout)
        writer.writerows(clean)

if __name__ == "__main__":
    main()


