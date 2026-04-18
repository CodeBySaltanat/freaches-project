from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from .models import Product, Category, Order, OrderItem
from .serializers import ProductSerializer, CategorySerializer, OrderSerializer

# --- МЕНЮ И КАТЕГОРИИ ---

@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    return Response(ProductSerializer(products, many=True).data)

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    return Response(CategorySerializer(categories, many=True).data)

# --- ЗАКАЗЫ (CRUD) ---

class OrderView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        orders = Order.objects.filter(user=request.user)
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Unauthorized"}, status=401)

        items_data = request.data.get('items', [])
        
        if not items_data:
            return Response({"error": "Корзина пуста"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.create(user=request.user)

            for item in items_data:
                OrderItem.objects.create(
                    order=order,
                    product_id=item['product'], # ID из Angular
                    quantity=item.get('quantity', 1)
                )

            return Response({"message": "ok", "id": order.id}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Заказ не найден"}, status=404)

        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Заказ не найден"}, status=404)

        order.delete()
        return Response({"message": "Заказ удален"})

# --- ПРОФИЛЬ (Второй CBV) ---

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "id": request.user.id
        })

# --- РЕГИСТРАЦИЯ ---

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({"error": "Нужны логин и пароль"}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({"error": "Такой юзер уже есть"}, status=400)

    user = User.objects.create_user(username=username, password=password)
    return Response({"message": "Ура, ты зарегистрирована!"}, status=201)