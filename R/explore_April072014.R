rm(list=ls())

#Import GCIF data from file as csv
gcif <- read.csv("/home/jvwong/Documents/GCIF/data/City Indicators Export - April 2014.csv", header=TRUE)

#import as data frame
df_gcif = as.data.frame(gcif)
attach(df_gcif)

#Replace the missing data with NA
df_gcif[is.na(df_gcif)]<-"NA"


#Some basic data table descriptors
dim = dim(df_gcif)

#List the first couple of rows
length(Employment.percentage.change.based.on.the.last.5.years_66)

