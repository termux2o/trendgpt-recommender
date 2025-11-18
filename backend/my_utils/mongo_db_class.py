# utils/mongo_db.py
from pymongo import MongoClient, errors
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus
import traceback

class MongoDBClient:
    def __init__(self):
        load_dotenv()  # Load .env variables

        self.user = quote_plus(os.getenv("USER_NAME_MONGO"))
        self.password = quote_plus(os.getenv("PASS_WORD_MONGO"))
        self.db_name = os.getenv("DB_NAME")
        self.cluster_name = os.getenv("CLUSTER_NAME")
        self.cluster_app_name = os.getenv("DB_CLUSTER_APP_NAME")

        self.connection_string = (
            f"mongodb+srv://{self.user}:{self.password}"
            f"@{self.cluster_name}/{self.db_name}"
            f"?retryWrites=true&w=majority&appName={self.cluster_app_name}"
        )
        self.client = None
        self.db = None

    def connect(self):
        """Connect to MongoDB and select the database."""
        try:
            self.client = MongoClient(self.connection_string, serverSelectionTimeoutMS=100000)
            # Trigger server selection to catch connection errors immediately
            self.client.server_info()
            self.db = self.client[self.db_name]
            print("Connected to database:", self.db.name)
            return self.db
        except errors.ServerSelectionTimeoutError as e:
            print("MongoDB server selection timeout error:", e)
            traceback.print_exc()
        except errors.ConnectionError as e:
            print("MongoDB connection error:", e)
            traceback.print_exc()
        except Exception as e:
            print("Unexpected error while connecting to MongoDB:", e)
            traceback.print_exc()

    def get_collections(self):
        """Return a list of collection names in the database."""
        try:
            if self.db is None:
                self.connect()
            return self.db.list_collection_names()
        except Exception as e:
            print(f"Error getting collections from database '{self.db_name}':", e)
            traceback.print_exc()

    def get_collection(self, collection_name):
        """Return a specific collection object."""
        try:
            if self.db is None:
                self.connect()
            return self.db[collection_name]
        except Exception as e:
            print(f"Error getting collection '{collection_name}' from database '{self.db_name}':", e)
            traceback.print_exc()
