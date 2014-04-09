/*
 * gcif.util.js
 * General JavaScript utilities
 *
 */

/*jslint          browser : true,  continue : true,
 devel  : true,  indent  : 2,     maxerr   : 50,
 newcap : true,  nomen   : true,  plusplus : true,
 regexp : true,  sloppy  : true,  vars     : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.util = (function () {
    var
      formatYear = d3.time.format("%Y")
    , parseData
    , initModule
    ;


    // Begin Public method /parseData/
    // Purpose: Format indicators column data
    // Arguments:
    //   * d - the data object
    // Returns: none
    // Throws : Exception if data is invalid
    //
    parseData = function( d ){

        try{
            d["collection_year"] = +d["collection_year"];
            d["CityName"] = d["CityName"];
            d["CityUniqueID_"] = +d["CityUniqueID_"];
            d["Annual population change _65"] = +d["Annual population change _65"];
            d["DataYear_65"] = formatYear.parse(d["DataYear_65"]);
            d["Employment percentage change based on the last 5 years_66"] = +d["Employment percentage change based on the last 5 years_66"];
            d["DataYear_66"] = formatYear.parse(d["DataYear_66"]);
            d["Country's GDP (US$)_67"] = +d["Country's GDP (US$)_67"];
            d["DataYear_67"] = formatYear.parse(d["DataYear_67"]);
            d["City product per capita (US$)_69"] = +d["City product per capita (US$)_69"];
            d["DataYear_69"] = formatYear.parse(d["DataYear_69"]);
            d["Country_70"] = d["Country_70"];
            d["DataYear_70"] = formatYear.parse(d["DataYear_70"]);
            d["Region_63"] = d["Region_63"];
            d["DataYear_63"] = formatYear.parse(d["DataYear_63"]);
            d["Land Area (Square Kilometers)_23"] = +d["Land Area (Square Kilometers)_23"];
            d["DataYear_23"] = formatYear.parse(d["DataYear_23"]);
            d["Climate Type_64"] = d["Climate Type_64"];
            d["DataYear_64"] = formatYear.parse(d["DataYear_64"]);
            d["Gross operating budget (US$)_31"] = +d["Gross operating budget (US$)_31"];
            d["DataYear_31"] = formatYear.parse(d["DataYear_31"]);
            d["Total city population_35"] = +d["Total city population_35"];
            d["DataYear_35"] = formatYear.parse(d["DataYear_35"]);
            d["Country's GDP per capita (US$)_55"] = +d["Country's GDP per capita (US$)_55"];
            d["DataYear_55"] = formatYear.parse(d["DataYear_55"]);
            d["Population density (per square kilometer)_36"] = +d["Population density (per square kilometer)_36"];
            d["DataYear_36"] = formatYear.parse(d["DataYear_36"]);
            d["Percentage of country's population_37"] = +d["Percentage of country's population_37"];
            d["DataYear_37"] = formatYear.parse(d["DataYear_37"]);
            d["Percentage of population that are children (aged 0-14)_38"] = +d["Percentage of population that are children (aged 0-14)_38"];
            d["DataYear_38"] = formatYear.parse(d["DataYear_38"]);
            d["Percentage of population that are youth (aged 15-24) _39"] = +d["Percentage of population that are youth (aged 15-24) _39"];
            d["DataYear_39"] = formatYear.parse(d["DataYear_39"]);
            d["Percentage of population that are adult (aged 25-64)_40"] = +d["Percentage of population that are adult (aged 25-64)_40"];
            d["DataYear_40"] = formatYear.parse(d["DataYear_40"]);
            d["Percentage of population that are senior citizens (aged 65+)_41"] = +d["Percentage of population that are senior citizens (aged 65+)_41"];
            d["DataYear_41"] = formatYear.parse(d["DataYear_41"]);
            d["Male to female ratio (# of males per 100 females)_42"] = +d["Male to female ratio (# of males per 100 females)_42"];
            d["DataYear_42"] = formatYear.parse(d["DataYear_42"]);
            d["Population percentage change since base year (base year is 1991)_43"] = +d["Population percentage change since base year (base year is 1991)_43"];
            d["DataYear_43"] = formatYear.parse(d["DataYear_43"]);
            d["Population Dependency Ratio _44"] = +d["Population Dependency Ratio _44"];
            d["DataYear_44"] = formatYear.parse(d["DataYear_44"]);
            d["Percentage of population that are new immigrants_45"] = +d["Percentage of population that are new immigrants_45"];
            d["DataYear_45"] = formatYear.parse(d["DataYear_45"]);
            d["Percentage of population that are migrating from elsewhere in the country_46"] = +d["Percentage of population that are migrating from elsewhere in the country_46"];
            d["DataYear_46"] = formatYear.parse(d["DataYear_46"]);
            d["Total number of households_47"] = +d["Total number of households_47"];
            d["DataYear_47"] = formatYear.parse(d["DataYear_47"]);
            d["Total number of occupied dwelling units (owned & rented)_48"] = +d["Total number of occupied dwelling units (owned & rented)_48"];
            d["DataYear_48"] = formatYear.parse(d["DataYear_48"]);
            d["Persons per unit_49"] = +d["Persons per unit_49"];
            d["DataYear_49"] = formatYear.parse(d["DataYear_49"]);
            d["Dwelling density (per Square Kilometer)_50"] = +d["Dwelling density (per Square Kilometer)_50"];
            d["DataYear_50"] = formatYear.parse(d["DataYear_50"]);
            d["Average household income (US$)_51"] = +d["Average household income (US$)_51"];
            d["DataYear_51"] = formatYear.parse(d["DataYear_51"]);
            d["Annual inflation rate based on average of last 5 years_52"] = +d["Annual inflation rate based on average of last 5 years_52"];
            d["DataYear_52"] = formatYear.parse(d["DataYear_52"]);
            d["Cost of living_53"] = +d["Cost of living_53"];
            d["DataYear_53"] = formatYear.parse(d["DataYear_53"]);
            d["Income distribution (Gini Coefficient)_54"] = +d["Income distribution (Gini Coefficient)_54"];
            d["DataYear_54"] = formatYear.parse(d["DataYear_54"]);
            d["City product as percentage of Country's GDP_56"] = +d["City product as percentage of Country's GDP_56"];
            d["DataYear_56"] = formatYear.parse(d["DataYear_56"]);
            d["Total employment_57"] = +d["Total employment_57"];
            d["DataYear_57"] = formatYear.parse(d["DataYear_57"]);
            d["Employment percentage change since base year (Base Year is 1991)_58"] = +d["Employment percentage change since base year (Base Year is 1991)_58"];
            d["DataYear_58"] = formatYear.parse(d["DataYear_58"]);
            d["Number of businesses per 1000 Population_59"] = +d["Number of businesses per 1000 Population_59"];
            d["DataYear_59"] = formatYear.parse(d["DataYear_59"]);
            d["Annual average unemployment rate_60"] = +d["Annual average unemployment rate_60"];
            d["DataYear_60"] = formatYear.parse(d["DataYear_60"]);
            d["Commercial/industrial assessment as a percentage of total assessment_61"] = +d["Commercial/industrial assessment as a percentage of total assessment_61"];
            d["DataYear_61"] = formatYear.parse(d["DataYear_61"]);
            d["Type of government (e.g. Local, Regional, County)_30"] = d["Type of government (e.g. Local, Regional, County)_30"];
            d["DataYear_30"] = formatYear.parse(d["DataYear_30"]);
            d["Gross operating budget per capita (US$) _32"] = +d["Gross operating budget per capita (US$) _32"];
            d["DataYear_32"] = formatYear.parse(d["DataYear_32"]);
            d["Gross capital budget (US$)_33"] = +d["Gross capital budget (US$)_33"];
            d["DataYear_33"] = formatYear.parse(d["DataYear_33"]);
            d["Gross capital budget per capita (US$)_34"] = +d["Gross capital budget per capita (US$)_34"];
            d["DataYear_34"] = formatYear.parse(d["DataYear_34"]);
            d["Percentage of non-residential area (square kilometers)_18"] = +d["Percentage of non-residential area (square kilometers)_18"];
            d["DataYear_18"] = formatYear.parse(d["DataYear_18"]);
            d["Annual average temperature (Celsius)_27"] = +d["Annual average temperature (Celsius)_27"];
            d["DataYear_27"] = formatYear.parse(d["DataYear_27"]);
            d["Average annual rainfall (mm)_28"] = +d["Average annual rainfall (mm)_28"];
            d["DataYear_28"] = formatYear.parse(d["DataYear_28"]);
            d["Average annual snowfall (cm)_29"] = +d["Average annual snowfall (cm)_29"];
            d["DataYear_29"] = formatYear.parse(d["DataYear_29"]);
            d["CityUniqueID"] = +d["CityUniqueID"];
            d["PM2.5 Concentration_219"] = +d["PM2.5 Concentration_219"];
            d["Total mass of collected particles that are 2.5 microns or less in diameter_219"] = +d["Total mass of collected particles that are 2.5 microns or less in diameter_219"];
            d["Volume of air sampled_219"] = +d["Volume of air sampled_219"];
            d["Data Year_219"] = formatYear.parse(d["Data Year_219"]);
            d["Student/teacher ratio_28"] = +d["Student/teacher ratio_28"];
            d["Number of Students_28"] = +d["Number of Students_28"];
            d["Number of Teachers_28"] = +d["Number of Teachers_28"];
            d["Data Year_28"] = formatYear.parse(d["Data Year_28"]);
            d["Percentage of students completing primary and secondary education: survival rate_26"] = +d["Percentage of students completing primary and secondary education: survival rate_26"];
            d["Students completing primary and secondary education_26"] = +d["Students completing primary and secondary education_26"];
            d["Number of students in school cohort_26"] = +d["Number of students in school cohort_26"];
            d["Data Year_26"] = formatYear.parse(d["Data Year_26"]);
            d["Percentage of students completing primary education_139"] = +d["Percentage of students completing primary education_139"];
            d["Children completing primary education_139"] = +d["Children completing primary education_139"];
            d["Number of pupils in school cohort_139"] = +d["Number of pupils in school cohort_139"];
            d["Data Year_139"] = formatYear.parse(d["Data Year_139"]);
            d["Percentage of students completing secondary education_140"] = +d["Percentage of students completing secondary education_140"];
            d["Children completing secondary education_140"] = +d["Children completing secondary education_140"];
            d["Number of children in school cohort_140"] = +d["Number of children in school cohort_140"];
            d["Data Year_140"] = formatYear.parse(d["Data Year_140"]);
            d["Percentage of school-aged  population enrolled in schools_27"] = +d["Percentage of school-aged  population enrolled in schools_27"];
            d["Total number of school aged population enrolled at primary and secondary schools in public and private schools_27"] = +d["Total number of school aged population enrolled at primary and secondary schools in public and private schools_27"];
            d["Total number of school aged population_27"] = +d["Total number of school aged population_27"];
            d["Data Year_27"] = formatYear.parse(d["Data Year_27"]);
            d["Percentage of male population enrolled in schools_142"] = +d["Percentage of male population enrolled in schools_142"];
            d["Number of male school aged population enrolled at primary and secondary levels in public and private schools_142"] = +d["Number of male school aged population enrolled at primary and secondary levels in public and private schools_142"];
            d["Total number of male school aged population_142"] = +d["Total number of male school aged population_142"];
            d["Data Year_142"] = formatYear.parse(d["Data Year_142"]);
            d["Percentage of female population enrolled in schools_141"] = +d["Percentage of female population enrolled in schools_141"];
            d["Number of female school aged population enrolled at primary and secondary levels in public and private schools_141"] = +d["Number of female school aged population enrolled at primary and secondary levels in public and private schools_141"];
            d["Total number of female school aged population_141"] = +d["Total number of female school aged population_141"];
            d["Data Year_141"] = formatYear.parse(d["Data Year_141"]);
            d["Number of firefighters per 100,000 population_32"] = +d["Number of firefighters per 100,000 population_32"];
            d["Number of Firefighters_32"] = +d["Number of Firefighters_32"];
            d["Total population divided by 100,000_32"] = +d["Total population divided by 100,000_32"];
            d["Data Year_32"] = formatYear.parse(d["Data Year_32"]);
            d["Number of fire related deaths per 100,000 population_36"] = +d["Number of fire related deaths per 100,000 population_36"];
            d["Number of fire related deaths_36"] = +d["Number of fire related deaths_36"];
            d["Total population divided by 100,000_36"] = +d["Total population divided by 100,000_36"];
            d["Data Year_36"] = formatYear.parse(d["Data Year_36"]);
            d["Response time for fire department from initial call_37"] = +d["Response time for fire department from initial call_37"];
            d["Data Year_37"] = formatYear.parse(d["Data Year_37"]);
            d["Number of in-patient hospital beds per 100,000 population_40"] = +d["Number of in-patient hospital beds per 100,000 population_40"];
            d["Number of in-patient hospital beds_40"] = +d["Number of in-patient hospital beds_40"];
            d["Total population divided by 100,000_40"] = +d["Total population divided by 100,000_40"];
            d["Data Year_40"] = formatYear.parse(d["Data Year_40"]);
            d["Number of physicians per 100,000 population_41"] = +d["Number of physicians per 100,000 population_41"];
            d["Number of physicians_41"] = +d["Number of physicians_41"];
            d["Total population divided by 100,000_41"] = +d["Total population divided by 100,000_41"];
            d["Data Year_41"] = formatYear.parse(d["Data Year_41"]);
            d["Average life expectancy_198"] = +d["Average life expectancy_198"];
            d["Data Year_198"] = formatYear.parse(d["Data Year_198"]);
            d["Under age five mortality per 1,000 live births_38"] = +d["Under age five mortality per 1,000 live births_38"];
            d["Under age five mortality_38"] = +d["Under age five mortality_38"];
            d["Number of live births divided by 1,000_38"] = +d["Number of live births divided by 1,000_38"];
            d["Data Year_38"] = formatYear.parse(d["Data Year_38"]);
            d["Number of nursing and midwifery personnel per 100,000 population_199"] = +d["Number of nursing and midwifery personnel per 100,000 population_199"];
            d["Number of nurses and midwives_199"] = +d["Number of nurses and midwives_199"];
            d["Total population divided by 100,000_199"] = +d["Total population divided by 100,000_199"];
            d["Data Year_199"] = formatYear.parse(d["Data Year_199"]);
            d["Square meters of public indoor recreation space per capita_42"] = +d["Square meters of public indoor recreation space per capita_42"];
            d["Public indoor recreation space in square meters_42"] = +d["Public indoor recreation space in square meters_42"];
            d["Population_42"] = +d["Population_42"];
            d["Data Year_42"] = formatYear.parse(d["Data Year_42"]);
            d["Square metres of public outdoor recreation space per capita_43"] = +d["Square metres of public outdoor recreation space per capita_43"];
            d["Public outdoor recreation space in square meters_43"] = +d["Public outdoor recreation space in square meters_43"];
            d["Population_43"] = +d["Population_43"];
            d["Data Year_43"] = formatYear.parse(d["Data Year_43"]);
            d["Number of police officers per 100,000 population_45"] = +d["Number of police officers per 100,000 population_45"];
            d["Number of police officers_45"] = +d["Number of police officers_45"];
            d["Total population divided by 100,000_45"] = +d["Total population divided by 100,000_45"];
            d["Data Year_45"] = formatYear.parse(d["Data Year_45"]);
            d["Number of homicides per 100,000 population_44"] = +d["Number of homicides per 100,000 population_44"];
            d["Number of homicides_44"] = +d["Number of homicides_44"];
            d["Total population divided by 100,000_44"] = +d["Total population divided by 100,000_44"];
            d["Data Year_44"] = formatYear.parse(d["Data Year_44"]);
            d["Violent crime rate per 100,000 population_46"] = +d["Violent crime rate per 100,000 population_46"];
            d["Number of violent crimes_46"] = +d["Number of violent crimes_46"];
            d["Total population divided by 100,000_46"] = +d["Total population divided by 100,000_46"];
            d["Data Year_46"] = formatYear.parse(d["Data Year_46"]);
            d["Percentage of city population with regular solid waste collection_47"] = +d["Percentage of city population with regular solid waste collection_47"];
            d["Population with regular solid waste collection_47"] = +d["Population with regular solid waste collection_47"];
            d["Total Population_47"] = +d["Total Population_47"];
            d["Data Year_47"] = formatYear.parse(d["Data Year_47"]);
            d["Percentage of the city's solid waste that is recycled_146"] = +d["Percentage of the city's solid waste that is recycled_146"];
            d["Tonnes recycled_146"] = +d["Tonnes recycled_146"];
            d["Total amount of waste_146"] = +d["Total amount of waste_146"];
            d["Data Year_146"] = formatYear.parse(d["Data Year_146"]);
            d["Percentage of the city's solid waste that is disposed of in an incinerator_144"] = +d["Percentage of the city's solid waste that is disposed of in an incinerator_144"];
            d["Tonnes disposed of in an incinerator_144"] = +d["Tonnes disposed of in an incinerator_144"];
            d["Total amount of solid waste_144"] = +d["Total amount of solid waste_144"];
            d["Data Year_144"] = formatYear.parse(d["Data Year_144"]);
            d["Percentage of the city's solid waste that is burned openly_197"] = +d["Percentage of the city's solid waste that is burned openly_197"];
            d["Tonnes of solid waste that is burned openly_197"] = +d["Tonnes of solid waste that is burned openly_197"];
            d["Total amount of solid waste_197"] = +d["Total amount of solid waste_197"];
            d["Data Year_197"] = formatYear.parse(d["Data Year_197"]);
            d["Percentage of the city's solid waste that is disposed of in an open dump_145"] = +d["Percentage of the city's solid waste that is disposed of in an open dump_145"];
            d["Tonnes disposed of in an open dump_145"] = +d["Tonnes disposed of in an open dump_145"];
            d["Total amount of solid waste_145"] = +d["Total amount of solid waste_145"];
            d["Data Year_145"] = formatYear.parse(d["Data Year_145"]);
            d["Percentage of the city's solid waste that is disposed of in a sanitary landfill_143"] = +d["Percentage of the city's solid waste that is disposed of in a sanitary landfill_143"];
            d["Tonnes disposed of in a sanitary landfill_143"] = +d["Tonnes disposed of in a sanitary landfill_143"];
            d["Total amount of solid waste_143"] = +d["Total amount of solid waste_143"];
            d["Data Year_143"] = formatYear.parse(d["Data Year_143"]);
            d["Percentage of the city's solid waste that is disposed of by other means_147"] = +d["Percentage of the city's solid waste that is disposed of by other means_147"];
            d["Tonnes disposed of by other means_147"] = +d["Tonnes disposed of by other means_147"];
            d["Total amount of solid waste_147"] = +d["Total amount of solid waste_147"];
            d["Data Year_147"] = formatYear.parse(d["Data Year_147"]);
            d["Km of high capacity public transit system per 100,000 population_200"] = +d["Km of high capacity public transit system per 100,000 population_200"];
            d["Total km of high capacity public transportation system_200"] = +d["Total km of high capacity public transportation system_200"];
            d["Total population divided by 100,000_200"] = +d["Total population divided by 100,000_200"];
            d["Data Year_200"] = formatYear.parse(d["Data Year_200"]);
            d["Km of light passenger transit system per 100,000 population_201"] = +d["Km of light passenger transit system per 100,000 population_201"];
            d["Total km of light transit transportation system_201"] = +d["Total km of light transit transportation system_201"];
            d["Total population divided by 100,000_201"] = +d["Total population divided by 100,000_201"];
            d["Data Year_201"] = formatYear.parse(d["Data Year_201"]);
            d["Number of personal automobiles per capita_202"] = +d["Number of personal automobiles per capita_202"];
            d["Total number of registered automobiles_202"] = +d["Total number of registered automobiles_202"];
            d["Population_202"] = +d["Population_202"];
            d["Data Year_202"] = formatYear.parse(d["Data Year_202"]);
            d["Annual number of public transit trips per capita_52"] = +d["Annual number of public transit trips per capita_52"];
            d["Number of transit trips_52"] = +d["Number of transit trips_52"];
            d["Population_52"] = +d["Population_52"];
            d["Data Year_52"] = formatYear.parse(d["Data Year_52"]);
            d["Number of two-wheel motorized vehicles per capita_203"] = +d["Number of two-wheel motorized vehicles per capita_203"];
            d["Total number of two-wheel motorized vehicles_203"] = +d["Total number of two-wheel motorized vehicles_203"];
            d["Population_203"] = +d["Population_203"];
            d["Data Year_203"] = formatYear.parse(d["Data Year_203"]);
            d["Commercial Air Connectivity (number of nonstop commercial air destinations)_53"] = +d["Commercial Air Connectivity (number of nonstop commercial air destinations)_53"];
            d["Data Year_53"] = formatYear.parse(d["Data Year_53"]);
            d["Transportation fatalities per 100,000 population_55"] = +d["Transportation fatalities per 100,000 population_55"];
            d["Total number of transportation fatalities_55"] = +d["Total number of transportation fatalities_55"];
            d["Total population divided by 100,000_55"] = +d["Total population divided by 100,000_55"];
            d["Data Year_55"] = formatYear.parse(d["Data Year_55"]);
            d["Percentage of city population served by wastewater collection_56"] = +d["Percentage of city population served by wastewater collection_56"];
            d["Number of people served by wastewater collection_56"] = +d["Number of people served by wastewater collection_56"];
            d["Population_56"] = +d["Population_56"];
            d["Data Year_56"] = formatYear.parse(d["Data Year_56"]);
            d["Percentage of the city's wastewater that has received no treatment_154"] = +d["Percentage of the city's wastewater that has received no treatment_154"];
            d["Volume of water receiving no treatment_154"] = +d["Volume of water receiving no treatment_154"];
            d["Volume of all wastewater collected_154"] = +d["Volume of all wastewater collected_154"];
            d["Data Year_154"] = formatYear.parse(d["Data Year_154"]);
            d["Percentage of the city's wastewater receiving primary treatment_155"] = +d["Percentage of the city's wastewater receiving primary treatment_155"];
            d["Volume of water receiving primary treatment_155"] = +d["Volume of water receiving primary treatment_155"];
            d["Volume of all wastewater collected_155"] = +d["Volume of all wastewater collected_155"];
            d["Data Year_155"] = formatYear.parse(d["Data Year_155"]);
            d["Percentage of the city's wastewater receiving secondary treatment_156"] = +d["Percentage of the city's wastewater receiving secondary treatment_156"];
            d["Volume of water receiving secondary treatment_156"] = +d["Volume of water receiving secondary treatment_156"];
            d["Volume of all wastewater collected_156"] = +d["Volume of all wastewater collected_156"];
            d["Data Year_156"] = formatYear.parse(d["Data Year_156"]);
            d["Percentage of the city's wastewater receiving tertiary treatment_157"] = +d["Percentage of the city's wastewater receiving tertiary treatment_157"];
            d["Volume of water receiving tertiary treatment_157"] = +d["Volume of water receiving tertiary treatment_157"];
            d["Volume of all wastewater collected_157"] = +d["Volume of all wastewater collected_157"];
            d["Data Year_157"] = formatYear.parse(d["Data Year_157"]);
            d["Percentage of city population with potable water supply service_59"] = +d["Percentage of city population with potable water supply service_59"];
            d["Number of people within the city that are served by a potable water supply_59"] = +d["Number of people within the city that are served by a potable water supply_59"];
            d["Population_59"] = +d["Population_59"];
            d["Data Year_59"] = formatYear.parse(d["Data Year_59"]);
            d["Total domestic water consumption per capita (litres/day)_61"] = +d["Total domestic water consumption per capita (litres/day)_61"];
            d["Total domestic water consumption in litres per day_61"] = +d["Total domestic water consumption in litres per day_61"];
            d["Population_61"] = +d["Population_61"];
            d["Data Year_61"] = formatYear.parse(d["Data Year_61"]);
            d["Percentage of city population with sustainable access to an improved water source_204"] = +d["Percentage of city population with sustainable access to an improved water source_204"];
            d["Population with access to the following types of water supply: piped water, public tap, borehole or pump, protected well, prote"] = +d["Population with access to the following types of water supply: piped water, public tap, borehole or pump, protected well, prote"];
            d["Population_204"] = +d["Population_204"];
            d["Data Year_204"] = formatYear.parse(d["Data Year_204"]);
            d["Total water consumption per capita (litres/day)_205"] = +d["Total water consumption per capita (litres/day)_205"];
            d["Total water consumption in litres per day_205"] = +d["Total water consumption in litres per day_205"];
            d["Population_205"] = +d["Population_205"];
            d["Data Year_205"] = formatYear.parse(d["Data Year_205"]);
            d["Percentage of water loss_206"] = +d["Percentage of water loss_206"];
            d["Data Year_206"] = formatYear.parse(d["Data Year_206"]);
            d["Average annual hours of water service interruption per household_207"] = +d["Average annual hours of water service interruption per household_207"];
            d["Sum of each interruption of hours of service interrupted times number of households impacted_207"] = +d["Sum of each interruption of hours of service interrupted times number of households impacted_207"];
            d["Total number of households_207"] = +d["Total number of households_207"];
            d["Data Year_207"] = formatYear.parse(d["Data Year_207"]);
            d["Percentage of city population with authorized electrical service_103"] = +d["Percentage of city population with authorized electrical service_103"];
            d["Population with authorized electrical service_103"] = +d["Population with authorized electrical service_103"];
            d["Population_103"] = +d["Population_103"];
            d["Data Year_103"] = formatYear.parse(d["Data Year_103"]);
            d["Total residential electrical use per capita (kWh/year)_208"] = +d["Total residential electrical use per capita (kWh/year)_208"];
            d["Residential electrical use in kilowatt hours per year_208"] = +d["Residential electrical use in kilowatt hours per year_208"];
            d["Population_208"] = +d["Population_208"];
            d["Data Year_208"] = formatYear.parse(d["Data Year_208"]);
            d["Total electrical use per capita (kWh/year)_104"] = +d["Total electrical use per capita (kWh/year)_104"];
            d["Electrical use in kilowatt hours per year_104"] = +d["Electrical use in kilowatt hours per year_104"];
            d["Population_104"] = +d["Population_104"];
            d["Data Year_104"] = formatYear.parse(d["Data Year_104"]);
            d["The average number of electrical interruptions per customer per year_158"] = +d["The average number of electrical interruptions per customer per year_158"];
            d["Total number of customer interruptions per year_158"] = +d["Total number of customer interruptions per year_158"];
            d["Total number of customers served per year_158"] = +d["Total number of customers served per year_158"];
            d["Data Year_158"] = formatYear.parse(d["Data Year_158"]);
            d["Average length of electrical interruptions (in hours)_159"] = +d["Average length of electrical interruptions (in hours)_159"];
            d["Sum of all customer interruption duration_159"] = +d["Sum of all customer interruption duration_159"];
            d["Total number of customer interruptions_159"] = +d["Total number of customer interruptions_159"];
            d["Data Year_159"] = formatYear.parse(d["Data Year_159"]);
            d["Debt service ratio (debt service expenditures as a percent of a municipality's own-source revenue)_106"] = +d["Debt service ratio (debt service expenditures as a percent of a municipality's own-source revenue)_106"];
            d["Total long-term debt servicing costs_106"] = +d["Total long-term debt servicing costs_106"];
            d["Total own source revenue_106"] = +d["Total own source revenue_106"];
            d["Data Year_106"] = formatYear.parse(d["Data Year_106"]);
            d["Tax collected as percentage of tax billed_107"] = +d["Tax collected as percentage of tax billed_107"];
            d["Tax collected_107"] = +d["Tax collected_107"];
            d["Tax billed_107"] = +d["Tax billed_107"];
            d["Data Year_107"] = formatYear.parse(d["Data Year_107"]);
            d["Own-source revenue as a percent of total revenues_108"] = +d["Own-source revenue as a percent of total revenues_108"];
            d["Own-source revenue_108"] = +d["Own-source revenue_108"];
            d["Total revenue_108"] = +d["Total revenue_108"];
            d["Data Year_108"] = formatYear.parse(d["Data Year_108"]);
            d["Capital spending as percentage of total expenditures_109"] = +d["Capital spending as percentage of total expenditures_109"];
            d["Capital spending_109"] = +d["Capital spending_109"];
            d["Total expenditures_109"] = +d["Total expenditures_109"];
            d["Data Year_109"] = formatYear.parse(d["Data Year_109"]);
            d["Percentage of women employed in the city government workforce_160"] = +d["Percentage of women employed in the city government workforce_160"];
            d["Number of women employees in the city government workforce_160"] = +d["Number of women employees in the city government workforce_160"];
            d["Total number of employees in the city government workforce_160"] = +d["Total number of employees in the city government workforce_160"];
            d["Data Year_160"] = formatYear.parse(d["Data Year_160"]);
            d["Jobs/Housing ratio_209"] = +d["Jobs/Housing ratio_209"];
            d["Total number of jobs_209"] = +d["Total number of jobs_209"];
            d["Number of dwelling units_209"] = +d["Number of dwelling units_209"];
            d["Data Year_209"] = formatYear.parse(d["Data Year_209"]);
            d["Areal size of informal settlements as a percent of city area_210"] = +d["Areal size of informal settlements as a percent of city area_210"];
            d["Size of informal settlements_210"] = +d["Size of informal settlements_210"];
            d["Total city area_210"] = +d["Total city area_210"];
            d["Data Year_210"] = formatYear.parse(d["Data Year_210"]);
            d["Green area (hectares) per 100,000 population_113"] = +d["Green area (hectares) per 100,000 population_113"];
            d["Green area in hectares_113"] = +d["Green area in hectares_113"];
            d["Total population divided by 100,000_113"] = +d["Total population divided by 100,000_113"];
            d["Data Year_113"] = formatYear.parse(d["Data Year_113"]);
            d["Voter participation in last municipal election (as a percent of eligible voters)_114"] = +d["Voter participation in last municipal election (as a percent of eligible voters)_114"];
            d["Participating voters_114"] = +d["Participating voters_114"];
            d["Eligible voters_114"] = +d["Eligible voters_114"];
            d["Data Year_114"] = formatYear.parse(d["Data Year_114"]);
            d["Citizen's representation: number of local officials elected to office per 100,000 population_115"] = +d["Citizen's representation: number of local officials elected to office per 100,000 population_115"];
            d["Number of local officials elected to office_115"] = +d["Number of local officials elected to office_115"];
            d["Total population divided by 100,000_115"] = +d["Total population divided by 100,000_115"];
            d["Data Year_115"] = formatYear.parse(d["Data Year_115"]);
            d["Percentage of jobs in the cultural sector_211"] = +d["Percentage of jobs in the cultural sector_211"];
            d["Number of jobs in the cultural sector_211"] = +d["Number of jobs in the cultural sector_211"];
            d["Total number of jobs_211"] = +d["Total number of jobs_211"];
            d["Data Year_211"] = formatYear.parse(d["Data Year_211"]);
            d["City product per capita_119"] = +d["City product per capita_119"];
            d["City product_119"] = +d["City product_119"];
            d["Population_119"] = +d["Population_119"];
            d["Data Year_119"] = formatYear.parse(d["Data Year_119"]);
            d["City unemployment rate_212"] = +d["City unemployment rate_212"];
            d["Total number of unemployed_212"] = +d["Total number of unemployed_212"];
            d["Labour force_212"] = +d["Labour force_212"];
            d["Data Year_212"] = formatYear.parse(d["Data Year_212"]);
            d["Percentage of persons in full time employment_213"] = +d["Percentage of persons in full time employment_213"];
            d["Number of persons in full time employment_213"] = +d["Number of persons in full time employment_213"];
            d["Total city population_213"] = +d["Total city population_213"];
            d["Data Year_213"] = formatYear.parse(d["Data Year_213"]);
            d["PM10 Concentration_214"] = +d["PM10 Concentration_214"];
            d["Total mass of collected particles in the PM10 size range_214"] = +d["Total mass of collected particles in the PM10 size range_214"];
            d["Volume of air sampled_214"] = +d["Volume of air sampled_214"];
            d["Data Year_214"] = formatYear.parse(d["Data Year_214"]);
            d["Greenhouse gas emissions measured in tonnes per capita_121"] = +d["Greenhouse gas emissions measured in tonnes per capita_121"];
            d["Greenhouse gas emissions in tonnes_121"] = +d["Greenhouse gas emissions in tonnes_121"];
            d["Total population_121"] = +d["Total population_121"];
            d["Data Year_121"] = formatYear.parse(d["Data Year_121"]);
            d["Percentage of city population living in slums_122"] = +d["Percentage of city population living in slums_122"];
            d["Population living in slums_122"] = +d["Population living in slums_122"];
            d["Total population_122"] = +d["Total population_122"];
            d["Data Year_122"] = formatYear.parse(d["Data Year_122"]);
            d["Percentage of households that exist without registered legal titles_215"] = +d["Percentage of households that exist without registered legal titles_215"];
            d["Number of households without registered legal title_215"] = +d["Number of households without registered legal title_215"];
            d["Total number of households_215"] = +d["Total number of households_215"];
            d["Data Year_215"] = formatYear.parse(d["Data Year_215"]);
            d["Number of homeless people per 100,000 population_216"] = +d["Number of homeless people per 100,000 population_216"];
            d["Number of homeless people_216"] = +d["Number of homeless people_216"];
            d["Total population divided by 100,000_216"] = +d["Total population divided by 100,000_216"];
            d["Data Year_216"] = formatYear.parse(d["Data Year_216"]);
            d["Percentage of city population living in poverty_124"] = +d["Percentage of city population living in poverty_124"];
            d["Population living in poverty_124"] = +d["Population living in poverty_124"];
            d["Total population_124"] = +d["Total population_124"];
            d["Data Year_124"] = formatYear.parse(d["Data Year_124"]);
            d["Number of internet connections per 100,000 population_125"] = +d["Number of internet connections per 100,000 population_125"];
            d["Number of internet connections_125"] = +d["Number of internet connections_125"];
            d["Total population divided by 100,000_125"] = +d["Total population divided by 100,000_125"];
            d["Data Year_125"] = formatYear.parse(d["Data Year_125"]);
            d["Number of new patents per 100,000 per year_217"] = +d["Number of new patents per 100,000 per year_217"];
            d["Number of new patents per year_217"] = +d["Number of new patents per year_217"];
            d["Population divided by 100,000_217"] = +d["Population divided by 100,000_217"];
            d["Data Year_217"] = formatYear.parse(d["Data Year_217"]);
            d["Number of higher education degrees per 100,000_218"] = +d["Number of higher education degrees per 100,000_218"];
            d["Number of post-secondary degrees_218"] = +d["Number of post-secondary degrees_218"];
            d["Population divided by 100,000_218"] = +d["Population divided by 100,000_218"];
            d["Data Year_218"] = formatYear.parse(d["Data Year_218"]);
            d["Number of telephone connections (landlines and cell phones) per 100,000 population_126"] = +d["Number of telephone connections (landlines and cell phones) per 100,000 population_126"];
            d["Number of telephone connections in the city including land lines and cellular connections_126"] = +d["Number of telephone connections in the city including land lines and cellular connections_126"];
            d["Total population divided by 100,000_126"] = +d["Total population divided by 100,000_126"];
            d["Data Year_126"] = formatYear.parse(d["Data Year_126"]);
            d["Number of landline phone connections per 100,000 population_176"] = +d["Number of landline phone connections per 100,000 population_176"];
            d["Number of landline phone connections_176"] = +d["Number of landline phone connections_176"];
            d["Total population divided by 100,000_176"] = +d["Total population divided by 100,000_176"];
            d["Data Year_176"] = formatYear.parse(d["Data Year_176"]);
            d["Number of cell phone connections per 100,000 population_177"] = +d["Number of cell phone connections per 100,000 population_177"];
            d["Number of cell phone connections_177"] = +d["Number of cell phone connections_177"];
            d["Total population divided by 100,000_177"] = +d["Total population divided by 100,000_177"];
            d["Data Year_177"] = formatYear.parse(d["Data Year_177"]);
        }
        catch(err){
            console.error(err);
        }
    };
    // End Public method /parseData/

    initModule = function ( $container ) {
        //do nothing
    };

    return {
          parseData : parseData
        , initModule : initModule
    };
}());


