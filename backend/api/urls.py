from django.urls import path
from .views import *

urlpatterns = [
    path('branches/', get_branches),
    path('products/', get_products),
    path('categories/', get_categories),

    path('manage-categories/', CategoryManageView.as_view()),

    path('manage-products/', ProductManageView.as_view()),
    path('manage-products/<int:pk>/', ProductManageView.as_view()),

    path('orders/', OrderView.as_view()),
    path('orders/<int:pk>/', OrderView.as_view()),

    path('login/', CustomTokenObtainPairView.as_view()),
    path('register/', register_user),
    path('profile/', ProfileView.as_view()),
]