import csv
import re


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




def main():

    fin = '/home/jvwong/Documents/GCIF/data/2008_gcif.csv'
    fout = fin.split('/')[-1]
    csvOut = cleanCells(fin)

    with open(fout, 'wb') as fout:
        writer = csv.writer(fout)
        writer.writerows(csvOut)


if __name__ == "__main__":
    main()