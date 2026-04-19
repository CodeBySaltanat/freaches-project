from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import *

urlpatterns = [
    path('branches/', get_branches),
    path('products/', get_products),
    path('categories/', get_categories),
    path('orders/', OrderView.as_view()),                
    path('orders/<int:pk>/', OrderView.as_view()),        
    path('login/', TokenObtainPairView.as_view()),
    path('register/', register_user),
    path('profile/', ProfileView.as_view()), # <-- Наш новый путь
]