from django.contrib.auth.models import User
from django.db.models import Sum, Count
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Branch,
    Category,
    Product,
    ProductImage,
    Order,
    OrderItem,
    Review,
    Favorite,
    UserProfile
)
from .serializers import (
    BranchSerializer,
    CategorySerializer,
    ProductSerializer,
    OrderSerializer,
    ProfileSerializer,
    ReviewSerializer,
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

    if branch_id:
        products = Product.objects.filter(branch_id=branch_id).prefetch_related('images', 'reviews__user')
    else:
        products = Product.objects.all().prefetch_related('images', 'reviews__user')

    return Response(ProductSerializer(products, many=True).data, status=200)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_detail(request, pk):
    try:
        product = Product.objects.prefetch_related('images', 'reviews__user').get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Товар не найден'}, status=404)

    return Response(ProductSerializer(product).data, status=200)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_categories(request):
    categories = Category.objects.all()
    return Response(CategorySerializer(categories, many=True).data, status=200)


class CategoryManageView(APIView):
    permission_classes = [IsAuthenticated]

    def is_producer(self, request):
        role = getattr(getattr(request.user, 'profile', None), 'role', 'buyer')
        return role == 'producer'

    def post(self, request):
        if not self.is_producer(request):
            return Response({'error': 'Только продавец может добавлять категории'}, status=403)

        name = str(request.data.get('name', '')).strip()

        if not name:
            return Response({'error': 'Название категории не может быть пустым'}, status=400)

        category, created = Category.objects.get_or_create(name=name)
        return Response(CategorySerializer(category).data, status=201 if created else 200)


class ProductManageView(APIView):
    permission_classes = [IsAuthenticated]

    def is_producer(self, request):
        role = getattr(getattr(request.user, 'profile', None), 'role', 'buyer')
        return role == 'producer'

    def get(self, request):
        if not self.is_producer(request):
            return Response({'error': 'Только продавец может управлять товарами'}, status=403)

        branch_id = request.GET.get('branch')
        products = Product.objects.filter(branch_id=branch_id).prefetch_related('images', 'reviews__user') if branch_id else Product.objects.all().prefetch_related('images', 'reviews__user')
        return Response(ProductSerializer(products, many=True).data)

    def post(self, request):
        if not self.is_producer(request):
            return Response({'error': 'Только продавец может добавлять товары'}, status=403)

        image_urls = request.data.get('image_urls', [])

        serializer = ProductSerializer(data={
            'name': request.data.get('name'),
            'price': request.data.get('price'),
            'description': request.data.get('description'),
            'category': request.data.get('category'),
            'branch': request.data.get('branch'),
            'is_available': request.data.get('is_available', True),
        })

        if serializer.is_valid():
            product = serializer.save()

            for index, url in enumerate(image_urls):
                if str(url).strip():
                    ProductImage.objects.create(
                        product=product,
                        image_url=str(url).strip(),
                        sort_order=index
                    )

            return Response(ProductSerializer(product).data, status=201)

        return Response(serializer.errors, status=400)

    def put(self, request, pk):
        if not self.is_producer(request):
            return Response({'error': 'Только продавец может менять товары'}, status=403)

        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Товар не найден'}, status=404)

        image_urls = request.data.get('image_urls', [])

        serializer = ProductSerializer(product, data={
            'name': request.data.get('name'),
            'price': request.data.get('price'),
            'description': request.data.get('description'),
            'category': request.data.get('category'),
            'branch': request.data.get('branch'),
            'is_available': request.data.get('is_available', True),
        }, partial=True)

        if serializer.is_valid():
            updated_product = serializer.save()

            updated_product.images.all().delete()

            for index, url in enumerate(image_urls):
                if str(url).strip():
                    ProductImage.objects.create(
                        product=updated_product,
                        image_url=str(url).strip(),
                        sort_order=index
                    )

            return Response(ProductSerializer(updated_product).data)

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


class ProductReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        role = getattr(getattr(request.user, 'profile', None), 'role', 'buyer')

        if role != 'buyer':
            return Response({'error': 'Только покупатель может оставлять отзывы'}, status=403)

        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Товар не найден'}, status=404)

        has_ordered = OrderItem.objects.filter(
            order__user=request.user,
            product=product
        ).exists()

        if not has_ordered:
            return Response({'error': 'Можно оставлять отзыв только на заказанный товар'}, status=403)

        try:
            rating = int(request.data.get('rating'))
        except (TypeError, ValueError):
            return Response({'error': 'Оценка должна быть числом от 1 до 5'}, status=400)

        if rating < 1 or rating > 5:
            return Response({'error': 'Оценка должна быть от 1 до 5'}, status=400)

        comment = str(request.data.get('comment', '')).strip()

        review, created = Review.objects.update_or_create(
            product=product,
            user=request.user,
            defaults={
                'rating': rating,
                'comment': comment
            }
        )

        return Response(ReviewSerializer(review).data, status=201 if created else 200)


class FavoriteView(APIView):
    permission_classes = [IsAuthenticated]

    def is_buyer(self, request):
        role = getattr(getattr(request.user, 'profile', None), 'role', 'buyer')
        return role == 'buyer'

    def get(self, request):
        if not self.is_buyer(request):
            return Response({'error': 'Только покупатель может использовать избранное'}, status=403)

        favorite_products = Product.objects.filter(
            favorited_by__user=request.user
        ).prefetch_related('images', 'reviews__user').distinct()

        return Response(ProductSerializer(favorite_products, many=True).data)

    def post(self, request, pk):
        if not self.is_buyer(request):
            return Response({'error': 'Только покупатель может использовать избранное'}, status=403)

        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Товар не найден'}, status=404)

        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            product=product
        )

        return Response(
            {'message': 'Добавлено в избранное', 'created': created},
            status=201 if created else 200
        )

    def delete(self, request, pk):
        if not self.is_buyer(request):
            return Response({'error': 'Только покупатель может использовать избранное'}, status=403)

        Favorite.objects.filter(user=request.user, product_id=pk).delete()
        return Response({'message': 'Удалено из избранного'})


class ProducerStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = getattr(getattr(request.user, 'profile', None), 'role', 'buyer')

        if role != 'producer':
            return Response({'error': 'Только продавец может смотреть статистику'}, status=403)

        orders = Order.objects.all()

        popular_products_raw = (
            OrderItem.objects
            .values('product__name')
            .annotate(total_qty=Sum('quantity'))
            .order_by('-total_qty')[:5]
        )

        branch_stats_raw = (
            OrderItem.objects
            .exclude(product__branch__isnull=True)
            .values('product__branch__name')
            .annotate(
                order_count=Count('order', distinct=True),
                total_items=Sum('quantity')
            )
            .order_by('-order_count')
        )

        return Response({
            'total_orders': orders.count(),
            'new_orders': orders.filter(status='pending').count(),
            'accepted_orders': orders.filter(status='accepted').count(),
            'ready_orders': orders.filter(status='ready').count(),
            'out_of_stock_orders': orders.filter(status='out_of_stock').count(),
            'completed_orders': orders.filter(status='completed').count(),
            'popular_products': [
                {
                    'name': item['product__name'],
                    'total_qty': item['total_qty'] or 0
                }
                for item in popular_products_raw
            ],
            'orders_by_branch': [
                {
                    'branch_name': item['product__branch__name'],
                    'order_count': item['order_count'],
                    'total_items': item['total_items'] or 0
                }
                for item in branch_stats_raw
            ]
        })


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
        data = ProfileSerializer(request.user).data
        recent_orders = Order.objects.filter(user=request.user).order_by('-created_at')[:10]
        data['recent_orders'] = OrderSerializer(recent_orders, many=True).data
        return Response(data)

    def put(self, request):
        profile = request.user.profile

        profile.full_name = str(request.data.get('full_name', '')).strip()
        profile.phone = str(request.data.get('phone', '')).strip()

        saved_addresses = request.data.get('saved_addresses', [])
        if not isinstance(saved_addresses, list):
            return Response({'error': 'saved_addresses должен быть списком'}, status=400)

        profile.saved_addresses = [
            str(address).strip()
            for address in saved_addresses
            if str(address).strip()
        ][:10]

        profile.save()

        data = ProfileSerializer(request.user).data
        recent_orders = Order.objects.filter(user=request.user).order_by('-created_at')[:10]
        data['recent_orders'] = OrderSerializer(recent_orders, many=True).data
        return Response(data)


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
        return Response({'error': 'Такой юзер already exists'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    UserProfile.objects.update_or_create(user=user, defaults={'role': role})

    return Response({
        'message': 'Пользователь успешно зарегистрирован',
        'user': ProfileSerializer(user).data
    }, status=201)