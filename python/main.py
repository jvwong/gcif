from gcif_util import checkHeaders, cleanCells


def main():

    fin = '/home/jvwong/Documents/GCIF/data/2014_gcif.csv'
    fout = fin.split('/')[-1]

    #Check headers
    #mismatch = checkHeaders('/home/jvwong/Documents/GCIF/data/2008_gcif.csv', '/home/jvwong/Documents/GCIF/data/2014_gcif.csv')

    # Write out cleaned data to csv files
    # csvOut = cleanCells(fin)
    # with open(fout, 'wb') as fout:
    #     writer = csv.writer(fout)
    #     writer.writerows(csvOut)


if __name__ == "__main__":
    main()