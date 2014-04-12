from gcif_util import *


def main():

    ### *********** Per city indicators (remove comment, n/a, data year)
    # fin = '/home/jvwong/Projects/GCIF/data/clean_compile.csv'
    # fout = "noText_" + fin.split('/')[-1]
    # csvout = perCityFilter(fin)
    #
    # with open(fout, 'wb') as fout:
    #     writer = csv.writer(fout)
    #     writer.writerows(csvout)


    ### *********** Automated d3 data type processing
    # jsText = formatHeaders('/home/jvwong/Projects/GCIF/data/clean_compile.csv')
    #
    # with open('/home/jvwong/Projects/GCIF/webapp/bdd/gcif_dash/src/parseData.js', 'wb') as fout:
    #     fout.write(jsText)

    ### *********** Cleaning of csv data removing units, commas, "n/a" fields
    fin = '/home/jvwong/Documents/GCIF/data/recent_gcif.csv'
    fout = fin.split('/')[-1]

    csvOut = cleanCells(fin)

    with open(fout, 'wb') as fout:
        writer = csv.writer(fout)
        writer.writerows(csvOut)

if __name__ == "__main__":
    main()