""" An example of how to insert a document """
#import sys
#from datetime import datetime
#from pymongo import Connection
#from pymongo.errors import ConnectionFailure
import csv


def main():

    # open the file
    fname = '/home/jvwong/Projects/GCIF/data/2008_gcif.csv'
    # fname = '/home/jvwong/Projects/GCIF/data/2014_gcif.csv'
    with open(fname, 'rb') as csvfile:

        #Instantiate a csv reader
        csvreader = csv.reader(csvfile, delimiter=',')

        #Read in first row of headers
        headers = csvreader.next()
        #print headers

        #loop through rows
        nrows = 0
        for row in csvreader:
            nrows += 1

        print nrows

if __name__ == "__main__":
    main()