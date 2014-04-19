rm(list=ls())
source("/home/jvwong/Projects/GCIF/R/util/multiplot.R")

#Import GCIF core indicator counts data from file 
gcif <- read.csv("/home/jvwong/Projects/GCIF/webapp/public/assets/data/member_recent_category_counts.csv", header=TRUE)

#import as data frame
df_gcif = as.data.frame(gcif)
attach(df_gcif)

#Replace the missing data with NA
df_gcif[is.na(df_gcif)]<-"NA"


#Basic statistics on the count data
# What are the sum total of counts for each across the categories?
# Get out the sum of core indicator columns (exclue first two cols)
themesums = data.frame("Counts" = colSums(df_gcif[,3:17]))

# plot and rotate x-axis labels
p_themecounts <- ggplot(themesums, aes(x=factor(rownames(themesums)), y=Counts)) + geom_bar(stat="identity") +
               theme(text = element_text(size=20), axis.text.x = element_text(angle=60, hjust=1, vjust=1)) +
               xlab("Themes") +
               ylab("Counts") + ylim(0, 400) +
             
               ggtitle("Member Cities: Core Indicators") +
               theme(plot.title=element_text(vjust = -2.5))


multiplot(p_themecounts, cols=1)



