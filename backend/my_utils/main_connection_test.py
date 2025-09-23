# main.py
from my_utils.mongo_db_class import MongoDBClient

mongo_client = MongoDBClient()
db = mongo_client.connect()
print("Collections:", mongo_client.get_collections())

appliances_collection = mongo_client.get_collection("Appliances")
print("Sample document:", appliances_collection.find_one())
