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
                if re.match('(?:datayear_)|(?:data year_)|(?:type of government_)', header.lower()):
                    statement = "d['%s'] = formatYear.parse(d['%s'])" % (header, header)

                # If it is a text column do not alter
                elif re.match('(?:country_)|(?:region_)', header.lower()):
                    statement = "d['%s'] = d['%s']" % (header, header)

                #Assume the rest are Numbers
                else:
                    statement = "d['%s'] = +d['%s']" % (header, header)

                #default
                output.append(statement)

    return output



# function: cleanCells
# @description: A function that clears out extraineous charactrs (e.g. units, commas, and N/A) from fields
# @pre-condition: valid csv file path
# @input:
#   fname - csv file path
# @output:
#   mismatch - a cleaned csv file
def cleanCells(fname):

    #Store the imported csv data as a list to output
    csvOut = []

    # open the file
    with open(fname, 'rb') as csvfile:

        #Instantiate a csv reader
        csvreader = csv.reader(csvfile, delimiter=',')

        #Read in first row of headers
        header = csvreader.next()
        csvOut.append(header)

        #loop through rows
        for idxr, row in enumerate(csvreader):

            #loop through cells
            for idxc, cell in enumerate(row):

                # Ignore any comment sections, URLS
                if not re.match('comment', cell.lower()) and not re.match('^http://', cell.lower()):
                    strip1 = re.sub('[\$,%]', "", cell) #strip units
                    strip2 = re.sub('N/A', "", strip1.upper()) #remove N/A fields
                    row[idxc] = strip2

            csvOut.append(row)

    return csvOut


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


