from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Branch, Category, Product, Order, OrderItem, UserProfile
from .serializers import (
    BranchSerializer,
    CategorySerializer,
    ProductSerializer,
    OrderSerializer,
    ProfileSerializer,
    CustomTokenObtainPairSerializer,
)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_branches(request):
    branches = Branch.objects.all()
    return Response(BranchSerializer(branches, many=True).data, status=200)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_products(request):
    branch_id = request.GET.get('branch')
    products = Product.objects.filter(branch_id=branch_id) if branch_id else Product.objects.all()
    return Response(ProductSerializer(products, many=True).data, status=200)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_categories(request):
    categories = Category.objects.all()
    return Response(CategorySerializer(categories, many=True).data, status=200)


class ProductManageView(APIView):
    permission_classes = [IsAuthenticated]

    def is_producer(self, request):
        role = getattr(getattr(request.user, 'profile', None), 'role', 'buyer')
        return role == 'producer'

    def get(self, request):
        if not self.is_producer(request):
            return Response({'error': 'Только продавец может управлять товарами'}, status=403)

        branch_id = request.GET.get('branch')
        products = Product.objects.filter(branch_id=branch_id) if branch_id else Product.objects.all()
        return Response(ProductSerializer(products, many=True).data)

    def post(self, request):
        if not self.is_producer(request):
            return Response({'error': 'Только продавец может добавлять товары'}, status=403)

        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def put(self, request, pk):
        if not self.is_producer(request):
            return Response({'error': 'Только продавец может менять товары'}, status=403)

        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Товар не найден'}, status=404)

        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        if not self.is_producer(request):
            return Response({'error': 'Только продавец может удалять товары'}, status=403)

        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Товар не найден'}, status=404)

        product.delete()
        return Response({'message': 'Товар удалён'})


class OrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = getattr(getattr(request.user, 'profile', None), 'role', 'buyer')

        if role == 'producer':
            orders = Order.objects.all().order_by('-created_at')
        else:
            orders = Order.objects.filter(user=request.user).order_by('-created_at')

        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        items_data = request.data.get('items', [])
        address = request.data.get('address', '')
        comment = request.data.get('comment', '')

        if not items_data:
            return Response({'error': 'Корзина пуста'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.create(
                user=request.user,
                status='pending',
                address=address,
                comment=comment
            )

            for item in items_data:
                OrderItem.objects.create(
                    order=order,
                    product_id=item['product'],
                    quantity=item.get('quantity', 1)
                )

            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        role = getattr(getattr(request.user, 'profile', None), 'role', 'buyer')

        if role != 'producer':
            return Response({'error': 'Только продавец может менять статус заказа'}, status=403)

        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Заказ не найден'}, status=404)

        new_status = request.data.get('status')

        allowed_statuses = ['pending', 'accepted', 'out_of_stock', 'ready', 'completed']

        if new_status not in allowed_statuses:
            return Response({'error': 'Неверный статус'}, status=400)

        order.status = new_status
        order.save()

        return Response(OrderSerializer(order).data)

    def delete(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Заказ не найден'}, status=404)

        order.delete()
        return Response({'message': 'Заказ удалён'})


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(ProfileSerializer(request.user).data)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role', 'buyer')

    if not username or not password:
        return Response({'error': 'Нужны логин и пароль'}, status=400)

    if role not in ['buyer', 'producer']:
        return Response({'error': 'Неверная роль'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Такой юзер уже есть'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    UserProfile.objects.update_or_create(user=user, defaults={'role': role})

    return Response({
        'message': 'Пользователь успешно зарегистрирован',
        'user': ProfileSerializer(user).data
    }, status=201)