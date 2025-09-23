# main.py
from mongo_db_class import MongoDBClient # because it is in same folder 
# if parent folder is diffrenet then 'my_utils.mongo_db_class'"
mongo_client = MongoDBClient()
db = mongo_client.connect()
print("Collections:", mongo_client.get_collections())
appliances_collection = mongo_client.get_collection("Appliances")
appliances_reviews = mongo_client.get_collection("Appliances_reviews")
print("Sample document:", appliances_collection.find_one())
print("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
print("sample_review:",appliances_reviews.find_one())
