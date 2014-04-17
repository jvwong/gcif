from mongoengine import *


# @Class: Data
# Description: A Data object represents raw information used as the basis of indicator metrics
class Data(EmbeddedDocument):
    name = StringField(max_length=120, required=True)
    id = StringField(max_length=120, required=True)
    value = StringField(max_length=120, required=True)
    units = StringField(max_length=120, required=True)

    meta = {'allow_inheritance': True}


class Value(Data):
    year = DateTimeField()


class Result(Data):
    numerator = FloatField()
    demoninator = FloatField()




# @Class: Comment
# Description: A Comment provides further detail, description, methodology
# or definition for an (performance) indicator
class Comment(EmbeddedDocument):
    content = StringField(max_length=5000)


# @Class: Indicators
# Description: An Indicator encapsulates knowledge regarding an aspect of a City
# Profile and Performance inherit from the base class
class Indicator(EmbeddedDocument):
    type = StringField(max_length=120, required=True)
    category = StringField(max_length=120, required=True)

    meta = {'allow_inheritance': True}


class ProfileIndicator(Indicator):
    characteristic = EmbeddedDocumentField(Value)


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

