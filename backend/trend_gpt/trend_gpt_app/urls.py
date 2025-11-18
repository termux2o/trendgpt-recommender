from django.urls import path
from .views import *
urlpatterns = [
    path('recommendations/', recommendations_api, name='recommendations'),
    path('main_category/',main_categories_api,name="main_category"),
    path('product_category_api/',product_category_api, name='product_category_api'),  # Make sure this matches
    path('search_text/',search_text,name='search_text'),
    path('reviews_list/',product_review_list,name='reviews_list')
]
