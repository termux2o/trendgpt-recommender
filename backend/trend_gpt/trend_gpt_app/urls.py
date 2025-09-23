from django.urls import path
from .views import recommendations_api

urlpatterns = [
    path('recommendations/', recommendations_api, name='recommendations'),
]
