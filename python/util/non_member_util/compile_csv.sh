#!/bin/bash

ROOT="/home/jvwong/Projects/GCIF/python/util/*_gcif.csv"
ROOTFILE="/home/jvwong/Projects/GCIF/python/util/2008_gcif.csv"
OUTFILE="clean_compile.csv"

for file in $ROOT
do
	if [ $file == $ROOTFILE ]
	then
		echo "ROOT file detected"
		cat $file >> $OUTFILE
	else
		echo "Processing $file"
		tail -n +2 $file >> $OUTFILE 
	fi

done
