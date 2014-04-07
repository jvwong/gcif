""" An example of how to insert a document """
#import sys
#from datetime import datetime
#from pymongo import Connection
#from pymongo.errors import ConnectionFailure
import csv
from lib2to3.patcomp import _type_of_literal


def main():

    #Store the imported csv data as a list to output
    data = []

    # open the file
    fname = '/home/jvwong/Documents/GCIF/data/2014_gcif.csv'
    # fname = '/home/jvwong/Projects/GCIF/data/2014_gcif.csv'
    with open(fname, 'rb') as csvfile:

        #Instantiate a csv reader
        csvreader = csv.reader(csvfile, delimiter=',')

        #Read in first row of headers
        column = csvreader.next()
        # print column[1:5]

        #loop through rows
        for idx, row in enumerate(csvreader):
            data.append(row)
            print idx


    print (data[0][0])
    print len(data[0])

    # with open('test.csv', 'wb') as f:
    #     writer = csv.writer(f)
    #     writer.writerows(someiterable)


if __name__ == "__main__":
    main()