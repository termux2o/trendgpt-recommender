import sys
import os

# Get path to backend folder (where manage.py is)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MY_UTILS_PATH = os.path.join(BASE_DIR, "my_utils")
sys.path.append(MY_UTILS_PATH)

from mongo_db_class import MongoDBClient
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import MongoDocumentSerializer

# Initialize MongoDB client
mongo_client = MongoDBClient()
db = mongo_client.connect()
import math
def clean_document(doc):
    for k, v in doc.items():
        if isinstance(v, float):
            if math.isnan(v) or math.isinf(v):
                doc[k] = None
    return doc

@api_view(['GET'])
def recommendations_api(request):
    try:
        appliances_collection = mongo_client.get_collection("Appliances")
        appliances_reviews = mongo_client.get_collection("Appliances_reviews")

        appliances = list(appliances_collection.find().limit(10))
        reviews = list(appliances_reviews.find().limit(10))

        # Clean NaN/Infinity
        appliances = [clean_document(doc) for doc in appliances]
        reviews = [clean_document(doc) for doc in reviews]

        # Serialize dynamically
        appliances_serialized = MongoDocumentSerializer(appliances, many=True).data
        reviews_serialized = MongoDocumentSerializer(reviews, many=True).data

        data = {
            "appliances": appliances_serialized,
            "reviews": reviews_serialized
        }

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)