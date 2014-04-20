# This script is aimed at getting a vague idea of which indicators and which themes are being 
# reported by each city. The "Total" simply sums up the indicators in each theme for all member cities (recent)
# The "Fraction" normalizes this against the number of cities and the indicators in the theme giving a
# sense of what data is most abundant


#Author: jvwong
#Date: April 14 2014


rm(list=ls())
library("ggplot2")
source("/home/jvwong/Projects/GCIF/R/util/multiplot.R")

#Import GCIF core indicator counts data from file 
gcif <- read.csv("/home/jvwong/Projects/GCIF/webapp/public/assets/data/member_recent_category_counts.csv", header=TRUE)
df_themecounts <- read.csv("/home/jvwong/Projects/GCIF/python/util/member_util/core_theme_counts.csv", header=TRUE)
df_col_themecounts <- do.call(rbind, df_themecounts)

#import as data frame
df_gcif = as.data.frame(gcif)
attach(df_gcif)

#Replace the missing data with NA
df_gcif[is.na(df_gcif)]<-"NA"


#Basic statistics on the count data
# What are the sum totals for each across the categories?
stats <- data.frame("Total"=colSums(df_gcif[,3:17]))
# What are the average number of indicators reported for all cities?
stats$Mean <- stats$Total / nrow(df_gcif)
# What fraction of the indicators does the mean represent?
stats$Fraction <- (stats$Mean / df_col_themecounts[1:15] )


# plot and rotate x-axis labels
p_themetotals <- ggplot(stats, aes(x=factor(rownames(stats)), y=Total)) + geom_bar(stat="identity") + 
               theme(text = element_text(size=20), axis.text.x = element_text(angle=60, hjust=1, vjust=1)) +
               xlab("Themes") +
               ylab("Total") + ylim(0, 400) +
             
               ggtitle("Member Cities: Total") +
               theme(plot.title=element_text(vjust = +2.0)) 


p_avgfraction  <- ggplot(stats, aes(x=factor(rownames(stats)), y=Fraction)) + geom_bar(stat="identity", fill="red") +
              theme(text = element_text(size=20), axis.text.x = element_text(angle=60, hjust=1, vjust=1)) +
              xlab("Themes") +
              ylab("Mean Fraction per City") + ylim(0, 0.4) +
              
              ggtitle("Member Cities: Fraction") +
              theme(plot.title=element_text(vjust = +2.0))

multiplot(p_themetotals, p_avgfraction, cols=2)




