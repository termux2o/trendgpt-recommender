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
    
@api_view(['GET'])
def main_categories_api(request):
    """
    Returns a list of distinct 'main_category' values from the Appliances collection
    """
    try:
        appliances_collection = mongo_client.get_collection("Appliances")
        
        # Get distinct main_category values
        distinct_categories = appliances_collection.distinct("main_category")
        
        # Remove None values
        distinct_categories = [c for c in distinct_categories if c is not None]
        
        # Sort alphabetically
        distinct_categories.sort()

        data = {
            "main_categories": distinct_categories
        }

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['POST'])
def product_category_api(request):
    """
    API that takes main_category as input and returns filtered products
    Uses direct MongoDB query for better performance
    """
    try:
        main_category = request.data.get('main_category')
        
        if not main_category:
            return Response(
                {"error": "main_category parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appliances_collection = mongo_client.get_collection("Appliances")
        appliances_reviews = mongo_client.get_collection("Appliances_reviews")

        # Filter appliances by main_category directly in MongoDB query
        filtered_appliances = list(appliances_collection.find({"main_category": main_category}))
        
        if not filtered_appliances:
            return Response(
                {"error": f"No products found for category: {main_category}"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get parent_asins for related reviews
        parent_asins = [appliance.get('parent_asin') for appliance in filtered_appliances if appliance.get('parent_asin')]
        
        # Get reviews for these products
        reviews = list(appliances_reviews.find({"parent_asin": {"$in": parent_asins}})) if parent_asins else []
        
        # Clean the documents
        filtered_appliances = [clean_document(doc) for doc in filtered_appliances]
        reviews = [clean_document(doc) for doc in reviews]
        
        # Serialize
        appliances_serialized = MongoDocumentSerializer(filtered_appliances, many=True).data
        reviews_serialized = MongoDocumentSerializer(reviews, many=True).data
        
        # Return same structure as recommendations_api
        data = {
            "appliances": appliances_serialized,
            "reviews": reviews_serialized
        }
        
        return Response(data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)