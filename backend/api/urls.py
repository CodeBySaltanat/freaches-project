from django.urls import path
from .views import *

urlpatterns = [
    path('branches/', get_branches),
    path('products/', get_products),
    path('products/<int:pk>/', get_product_detail),
    path('products/<int:pk>/reviews/', ProductReviewView.as_view()),
    path('categories/', get_categories),

    path('favorites/', FavoriteView.as_view()),
    path('favorites/<int:pk>/', FavoriteView.as_view()),

    path('manage-categories/', CategoryManageView.as_view()),
    path('manage-products/', ProductManageView.as_view()),
    path('manage-products/<int:pk>/', ProductManageView.as_view()),

    path('orders/', OrderView.as_view()),
    path('orders/<int:pk>/', OrderView.as_view()),

    path('login/', CustomTokenObtainPairView.as_view()),
    path('logout/', logout_user),
    path('register/', register_user),
    path('profile/', ProfileView.as_view()),
    path('producer-stats/', ProducerStatsView.as_view()),
]