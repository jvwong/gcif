rm(list=ls())

#Import GCIF data from file as csv
gcif <- read.csv("/home/jvwong/Projects/GCIF/webapp/public/assets/data/member_recent_category_counts.csv", header=TRUE)

#import as data frame
df_gcif = as.data.frame(gcif)
attach(df_gcif)

#Replace the missing data with NA
df_gcif[is.na(df_gcif)]<-"NA"

#Some basic data table descriptors
dim = dim(df_gcif)



