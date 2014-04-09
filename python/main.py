from gcif_util import checkHeaders, cleanCells, formatHeaders


def main():

    #Automated d3 data type processing
    assignments = formatHeaders('/home/jvwong/Projects/GCIF/data/clean_compile.csv')
    with open('d3-headers.txt', 'wb') as fout:

        for cell in assignments:
            fout.write(cell)
            fout.write("\n")



    ##### Initial data cleaning
    # fin = '/home/jvwong/Documents/GCIF/data/2014_gcif.csv'
    # fout = fin.split('/')[-1]

    #Check headers
    #mismatch = checkHeaders('/home/jvwong/Documents/GCIF/data/2008_gcif.csv', '/home/jvwong/Documents/GCIF/data/2014_gcif.csv')

    # Write out cleaned data to csv files
    # csvOut = cleanCells(fin)
    # with open(fout, 'wb') as fout:
    #     writer = csv.writer(fout)
    #     writer.writerows(csvOut)

    ##### Initial data cleaning
    # fin = '/home/jvwong/Documents/GCIF/data/2014_gcif.csv'
    # fout = fin.split('/')[-1]



if __name__ == "__main__":
    main()