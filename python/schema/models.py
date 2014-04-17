from mongoengine import *


## ****************** Data
# @Class: Data
# Inherits EmbeddedDocument
# Description: A Data object represents raw information used as the basis of indicator metrics
class Data(EmbeddedDocument):
    name = StringField(max_length=120, required=True)
    id = StringField(max_length=120, required=True)
    value = StringField(max_length=120, required=True)
    units = StringField(max_length=120, required=True)

    meta = {'allow_inheritance': True}


# @Class: Characteristic
# Inherits Data
# Description: A Characteristic is specific for a profile indicator
class Characteristic(Data):
    year = DateTimeField()


# @Class: Result
# Inherits Data
# Description: A Result is specific for a performance indicator
class Result(Data):
    numerator = FloatField()
    demoninator = FloatField()


## ****************** Comment
# @Class: Comment
# Description: A Comment provides further detail, description, methodology
# or definition for an (performance) indicator
class Comment(EmbeddedDocument):
    content = StringField(max_length=5000)


## ****************** Indicators
# @Class: Indicator
# Description: An Indicator encapsulates knowledge regarding an aspect of a City
class Indicator(EmbeddedDocument):
    type = StringField(max_length=120, required=True)
    category = StringField(max_length=120, required=True)

    meta = {'allow_inheritance': True}


# @Class: ProfileIndicator
# Inherits Indicator
# Description: A Profile indicator inherits from Indicator and specifies an atomic characteristic of a city
class ProfileIndicator(Indicator):
    characteristic = EmbeddedDocumentField(Characteristic)


THEMES = ('Economy'
          , 'Education'
          , 'Energy'
          , 'Environment'
          , 'Finance'
          , 'Fire and Emergency Response'
          , 'Governance'
          , 'Health'
          , 'Recreation'
          , 'Safety'
          , 'Shelter'
          , 'Sold Waste'
          , 'Technology and Innovation'
          , 'Transportation'
          , 'Urban Planning'
          , 'Wastewater'
          , 'Water and Sanitation')


class PerformanceIndicator(Indicator):
    # result = EmbeddedDocumentField(Result)
    theme = StringField(required=True, choices=THEMES)
    comment = EmbeddedDocumentField(Comment)
    service_provide = StringField(max_length=120)



# @Class: City
# Description: A City encapsulates a place and it's related indicators
class City(Document):
    name = StringField(max_length=120, required=True)
    CityUniqueID = IntField(min_value=0)
    Indicators = ListField(EmbeddedDocumentField(Indicator), default=list)

