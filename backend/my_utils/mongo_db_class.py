# utils/mongo_db.py
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

class MongoDBClient:
    def __init__(self):
        load_dotenv()  # Load .env variables

        self.user = quote_plus(os.getenv("USER_NAME_MONGO"))
        self.password = quote_plus(os.getenv("PASS_WORD_MONGO"))
        self.db_name = os.getenv("DB_NAME")
        self.cluster_name = os.getenv("CLUSTER_NAME")

        self.connection_string = (
            f"mongodb+srv://{self.user}:{self.password}"
            f"@{self.cluster_name}/{self.db_name}"
            "?retryWrites=true&w=majority&appName=Cluster0"
        )
        self.client = None
        self.db = None

    def connect(self):
        """Connect to MongoDB and select the database."""
        self.client = MongoClient(self.connection_string)
        self.db = self.client[self.db_name]
        print("Connected to database:", self.db.name)
        return self.db

    def get_collections(self):
        """Return a list of collection names in the database."""
        if not self.db:
            self.connect()
        return self.db.list_collection_names()

    def get_collection(self, collection_name):
        """Return a specific collection object."""
        if not self.db:
            self.connect()
        return self.db[collection_name]
