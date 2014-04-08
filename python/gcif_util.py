import csv
import re

# function: compileCsv
# @description: A function that aggregates csv files
# @pre-condition: a valid path to containing directory
# @input:
#   froot - directory path
# @output:
#   none
def compile_csv(froot):
    data = []



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


