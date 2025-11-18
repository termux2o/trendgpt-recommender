import sys
import os
from math import ceil
# Get path to backend folder (where manage.py is)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MY_UTILS_PATH = os.path.join(BASE_DIR, "my_utils")
sys.path.append(MY_UTILS_PATH)

from mongo_db_class import MongoDBClient
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import MongoDocumentSerializer
from .Quer_to_json_formatter import QueryFormatter
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
    try:
        main_category = request.data.get('main_category')
        page = int(request.data.get('page', 1))  # default page 1
        page_size = int(request.data.get('page_size', 50))  # default 50

        if not main_category:
            return Response(
                {"error": "main_category parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        appliances_collection = mongo_client.get_collection("Appliances")
        appliances_reviews = mongo_client.get_collection("Appliances_reviews")

        query = {"main_category": main_category}

        # ✅ Fixed: use count_documents instead of cursor.count()
        total_count = appliances_collection.count_documents(query)
        total_pages = ceil(total_count / page_size)

        # Apply pagination
        filtered_appliances = list(
            appliances_collection.find(query)
            .skip((page - 1) * page_size)
            .limit(page_size)
        )

        if not filtered_appliances:
            return Response(
                {"error": f"No products found for category: {main_category} on page {page}"},
                status=status.HTTP_404_NOT_FOUND
            )

        parent_asins = [appliance.get('parent_asin') for appliance in filtered_appliances if appliance.get('parent_asin')]
        reviews = list(appliances_reviews.find({"parent_asin": {"$in": parent_asins}})) if parent_asins else []

        filtered_appliances = [clean_document(doc) for doc in filtered_appliances]
        reviews = [clean_document(doc) for doc in reviews]

        appliances_serialized = MongoDocumentSerializer(filtered_appliances, many=True).data
        reviews_serialized = MongoDocumentSerializer(reviews, many=True).data

        data = {
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "total_results": total_count,
            "appliances": appliances_serialized,
            "reviews": reviews_serialized
        }

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['POST'])
def search_text(request):
    try:
        query_data = request.data.get('query', {})
        searched_text = query_data.get('searched_text', None)
        print("search text is:", searched_text)

        # If empty search, return default categories
        if not searched_text or searched_text.strip() == "":
            print("empty search")
            return Response({
                "searchCategories": [],  # or your default categories
                "message": "Empty search, returning default categories"
            }, status=status.HTTP_200_OK)

        # Call QueryFormatter safely
        formatter = QueryFormatter(searched_text)
        try:
            formatted_json = formatter.generate_json()
        except Exception as fe:
            print("Formatter error:", fe)
            formatted_json = []

        print("formatted json is:", formatted_json)
        category = formatted_json.get('category')           # 'beauty_personal_care'
        subcategories = formatted_json.get('subcategories') # ['shampoo', 'skincare']
        price_max = formatted_json.get('price_max')         # None
        brand = formatted_json.get('brand')                 # 'Dove'
        tags = formatted_json.get('tags')                   # ['cheap']

        # Example usage
        print("Category:", category)
        print("Subcategories:", subcategories)
        print("Max Price:", price_max)
        print("Brand:", brand)
        print("Tags:", tags)

        appliances_collection = mongo_client.get_collection("Appliances")
        appliances_reviews = mongo_client.get_collection("Appliances_reviews")
        return Response({
            "searchCategories": formatted_json or ["example_category_1", "example_category_2"],
            "message": f"Results for '{searched_text}'"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        print("Exception in search_text:", traceback.format_exc())
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# def clean_document(doc):
#     if not isinstance(doc, dict):
#         return doc

#     cleaned = {}

#     for key, value in doc.items():

#         # Handle Mongo _id
#         if key == "_id":
#             cleaned["_id"] = str(value)
#             continue

#         # Handle { "$numberInt": "5" }
#         if isinstance(value, dict) and "$numberInt" in value:
#             cleaned[key] = int(value["$numberInt"])
#             continue

#         # Handle { "$numberLong": "160958..." }
#         if isinstance(value, dict) and "$numberLong" in value:
#             cleaned[key] = int(value["$numberLong"])
#             continue

#         # Handle timestamp { "$date": { "$numberLong": ... } }
#         if isinstance(value, dict) and "$date" in value:
#             try:
#                 milli = int(value["$date"]["$numberLong"])
#                 from datetime import datetime
#                 cleaned[key] = datetime.fromtimestamp(milli / 1000).isoformat()
#             except:
#                 cleaned[key] = None
#             continue

#         cleaned[key] = value

#     return cleaned

@api_view(['POST'])
def product_review_list(request):
    pass
#     try:
#         parent_asin = request.data.get("parent_asin")
#         page = int(request.data.get("page", 1))
#         page_size = int(request.data.get("page_size", 10))

#         if not parent_asin:
#             return Response({"error": "parent_asin is required"}, status=400)

#         appliances_reviews = mongo_client.get_collection("Appliances_reviews")

#         query = {"parent_asin": parent_asin}

#         total_results = appliances_reviews.count_documents(query)
#         total_pages = ceil(total_results / page_size)

#         reviews = list(
#             appliances_reviews.find(query)
#             .skip((page - 1) * page_size)
#             .limit(page_size)
#         )

#         reviews = [clean_document(r) for r in reviews]
#         reviews_serialized = MongoDocumentSerializer(reviews, many=True).data

#         return Response({
#             "parent_asin": parent_asin,
#             "page": page,
#             "page_size": page_size,
#             "total_pages": total_pages,
#             "total_results": total_results,
#             "reviews": reviews_serialized,
#         }, status=200)

#     except Exception as e:
#         return Response({"error": str(e)}, status=500)