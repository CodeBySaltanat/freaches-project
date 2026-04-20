import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page" *ngIf="!loading && product">
      <div class="topbar">
        <div>
          <h1>{{ product.name }}</h1>
          <p>Подробная страница товара</p>
        </div>

        <div class="topbar-actions">
          <button (click)="goBack()">Назад</button>
          <button (click)="openCart()">Корзина ({{ getCartCount() }})</button>
          <button class="ghost" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state error" *ngIf="errorMessage">{{ errorMessage }}</div>
      <div class="state success" *ngIf="successMessage">{{ successMessage }}</div>

      <div class="product-layout">
        <div class="gallery-card">
          <img
            class="main-image"
            [src]="product.images?.[selectedImageIndex]?.image_url || 'https://picsum.photos/seed/noimage/900/700'"
            [alt]="product.name"
          />

          <div class="thumbs" *ngIf="product.images?.length">
            <img
              *ngFor="let image of product.images; let i = index"
              class="thumb"
              [class.active]="selectedImageIndex === i"
              [src]="image.image_url"
              [alt]="product.name"
              (click)="selectedImageIndex = i"
            />
          </div>
        </div>

        <div class="info-card">
          <div class="chips">
            <span class="category-chip">{{ productCategoryName }}</span>
            <span class="stock-chip" [class.out]="product.is_available === false">
              {{ product.is_available === false ? 'Нет в наличии' : 'В наличии' }}
            </span>
          </div>

          <div class="rating">
            {{ formatRating(product.avg_rating) }} ⭐ · {{ product.reviews_count || 0 }} отзывов
          </div>

          <p class="description">{{ product.description }}</p>

          <div class="price">{{ product.price }} ₸</div>

          <div class="actions">
            <ng-container *ngIf="product.is_available !== false; else unavailableTpl">
              <button *ngIf="getItemCount(product.id) === 0" (click)="addToCart(product)">В корзину</button>

              <div class="qty-box" *ngIf="getItemCount(product.id) > 0">
                <button class="qty-btn" (click)="decreaseQty(product.id)">−</button>
                <span class="qty-value">{{ getItemCount(product.id) }}</span>
                <button class="qty-btn" (click)="increaseQty(product.id)">+</button>
              </div>
            </ng-container>

            <ng-template #unavailableTpl>
              <div class="unavailable">Нет в наличии</div>
            </ng-template>

            <button class="favorite-btn" (click)="toggleFavorite()">
              {{ isFavorite ? 'Убрать из избранного ❤️' : 'Добавить в избранное 🤍' }}
            </button>
          </div>
        </div>
      </div>

      <div class="block" *ngIf="similarProducts.length > 0">
        <h2>Похожие товары</h2>
        <div class="similar-grid">
          <div class="similar-card" *ngFor="let item of similarProducts" (click)="openProduct(item.id)">
            <img
              [src]="item.images?.[0]?.image_url || 'https://picsum.photos/seed/noimage/500/300'"
              [alt]="item.name"
            />
            <strong>{{ item.name }}</strong>
            <span>{{ item.price }} ₸</span>
          </div>
        </div>
      </div>

      <div class="block">
        <h2>Отзывы</h2>

        <div class="review-form">
          <label>Твоя оценка</label>
          <div class="stars">
            <button
              type="button"
              class="star-btn"
              *ngFor="let star of starOptions"
              [class.active]="reviewRating >= star"
              (click)="reviewRating = star">
              ★
            </button>
          </div>

          <label>Твой отзыв</label>
          <textarea
            [(ngModel)]="reviewComment"
            rows="4"
            placeholder="Напиши отзыв">
          </textarea>

          <button (click)="submitReview()">Сохранить отзыв</button>
        </div>

        <div class="review-list" *ngIf="product.reviews?.length > 0; else noReviews">
          <div class="review-item" *ngFor="let review of product.reviews">
            <div class="review-head">
              <strong>{{ review.user_name }}</strong>
              <span>{{ review.rating }} ⭐</span>
            </div>
            <p>{{ review.comment || 'Без текста' }}</p>
          </div>
        </div>

        <ng-template #noReviews>
          <div class="empty">Пока отзывов нет.</div>
        </ng-template>
      </div>
    </div>

    <div class="page" *ngIf="loading">
      <div class="state">Загружаю товар...</div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      padding: 32px;
      background: #f7f1ea;
      font-family: Arial, sans-serif;
      box-sizing: border-box;
      max-width: 1280px;
      margin: 0 auto;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 28px;
      flex-wrap: wrap;
    }

    .topbar-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .topbar-actions button,
    .actions button,
    .review-form button {
      border: none;
      border-radius: 12px;
      padding: 12px 16px;
      background: #ff8a3d;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .ghost {
      background: #333 !important;
    }

    h1, h2 {
      margin: 0 0 10px;
    }

    .state, .gallery-card, .info-card, .block {
      background: white;
      border-radius: 18px;
      padding: 20px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
      margin-bottom: 18px;
    }

    .state.error {
      background: #fff1f0;
      color: #c23b2f;
    }

    .state.success {
      background: #ecfdf3;
      color: #027a48;
    }

    .product-layout {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 18px;
      margin-bottom: 18px;
    }

    .main-image {
      width: 100%;
      height: 420px;
      object-fit: cover;
      border-radius: 16px;
      background: #f2f2f2;
      display: block;
    }

    .thumbs {
      display: flex;
      gap: 10px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .thumb {
      width: 88px;
      height: 70px;
      object-fit: cover;
      border-radius: 10px;
      cursor: pointer;
      border: 3px solid transparent;
    }

    .thumb.active {
      border-color: #ff8a3d;
    }

    .chips {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .category-chip,
    .stock-chip {
      display: inline-block;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 700;
    }

    .category-chip {
      background: #fff2e9;
      color: #ff8a3d;
    }

    .stock-chip {
      background: #ecfdf3;
      color: #027a48;
    }

    .stock-chip.out {
      background: #e5e7eb;
      color: #555;
    }

    .rating {
      font-weight: 700;
      margin-bottom: 12px;
    }

    .description {
      color: #555;
      margin-bottom: 18px;
    }

    .price {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 18px;
    }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    .qty-box {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #fff2e9;
      border-radius: 999px;
      padding: 8px 12px;
    }

    .qty-btn {
      width: 34px;
      height: 34px;
      border: none;
      border-radius: 999px;
      background: #ff8a3d;
      color: white;
      font-size: 22px;
      cursor: pointer;
    }

    .qty-value {
      min-width: 18px;
      text-align: center;
      font-weight: 800;
    }

    .unavailable {
      background: #e5e7eb;
      color: #555;
      padding: 12px 16px;
      border-radius: 12px;
      font-weight: 700;
    }

    .similar-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 280px));
      gap: 14px;
      justify-content: start;
    }

    .similar-card {
      width: 100%;
      max-width: 280px;
      background: #f8f8f8;
      border-radius: 14px;
      padding: 12px;
      cursor: pointer;
      box-sizing: border-box;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .similar-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(0,0,0,0.08);
    }

    .similar-card img {
      width: 100%;
      height: 160px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 10px;
      display: block;
    }

    .similar-card strong,
    .similar-card span {
      display: block;
    }

    .similar-card span {
      color: #666;
      margin-top: 4px;
    }

    .review-form {
      margin-bottom: 18px;
    }

    .review-form label {
      display: block;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .stars {
      display: flex;
      gap: 6px;
      margin-bottom: 12px;
    }

    .star-btn {
      background: transparent !important;
      color: #bbb !important;
      font-size: 28px;
      padding: 0 !important;
      border: none;
    }

    .star-btn.active {
      color: #ff8a3d !important;
    }

    textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 14px;
      border: 1px solid #d8d8d8;
      border-radius: 12px;
      font-size: 15px;
      font-family: Arial, sans-serif;
      resize: vertical;
      margin-bottom: 12px;
    }

    .review-list {
      display: grid;
      gap: 10px;
    }

    .review-item {
      background: #f8f8f8;
      border-radius: 12px;
      padding: 12px;
    }

    .review-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 6px;
    }

    .empty {
      color: #777;
    }

    @media (max-width: 900px) {
      .product-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;
  similarProducts: any[] = [];
  categories: any[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';
  selectedImageIndex = 0;
  isFavorite = false;
  reviewRating = 0;
  reviewComment = '';
  starOptions = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProduct();
  }

  get productCategoryName(): string {
    if (!this.product) return 'Без категории';
    const category = this.categories.find((item: any) => Number(item.id) === Number(this.product.category));
    return category ? category.name : 'Без категории';
  }

  async loadProduct() {
    try {
      const id = this.route.snapshot.paramMap.get('id');
      const token = localStorage.getItem('token');

      const productResponse = await fetch('http://127.0.0.1:8000/api/products/' + id + '/');
      if (!productResponse.ok) throw new Error('Не удалось загрузить товар');

      const productData = await productResponse.json();
      this.product = productData;

      const [categoriesResponse, similarResponse, favoritesResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/categories/'),
        fetch('http://127.0.0.1:8000/api/products/?branch=' + productData.branch),
        fetch('http://127.0.0.1:8000/api/favorites/', {
          headers: { 'Authorization': 'Bearer ' + token }
        })
      ]);

      this.categories = await categoriesResponse.json();
      const similarData = await similarResponse.json();
      const favoritesData = await favoritesResponse.json();

      this.similarProducts = (Array.isArray(similarData) ? similarData : []).filter((item: any) =>
        Number(item.id) !== Number(productData.id) &&
        Number(item.category) === Number(productData.category)
      ).slice(0, 4);

      this.isFavorite = (Array.isArray(favoritesData) ? favoritesData : []).some((item: any) => Number(item.id) === Number(productData.id));

      const myReview = (productData.reviews || []).find((review: any) => review.user_name === localStorage.getItem('username'));
      if (myReview) {
        this.reviewRating = myReview.rating;
        this.reviewComment = myReview.comment || '';
      }

      this.loading = false;
      this.cdr.detectChanges();
    } catch (error) {
      this.loading = false;
      this.errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки товара';
      this.cdr.detectChanges();
    }
  }

  getCartCount() {
    return this.cartService.getTotalCount();
  }

  getItemCount(productId: number) {
    return this.cartService.getItemCount(productId);
  }

  addToCart(item: any) {
    if (item.is_available === false) return;
    this.cartService.addItem(item);
    this.successMessage = item.name + ' добавлен в корзину';
    this.cdr.detectChanges();
  }

  increaseQty(productId: number) {
    this.cartService.increaseItem(productId);
    this.cdr.detectChanges();
  }

  decreaseQty(productId: number) {
    this.cartService.decreaseItem(productId);
    this.cdr.detectChanges();
  }

  async toggleFavorite() {
    const token = localStorage.getItem('token');
    if (!token || !this.product) return;

    const response = await fetch('http://127.0.0.1:8000/api/favorites/' + this.product.id + '/', {
      method: this.isFavorite ? 'DELETE' : 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (response.ok) {
      this.isFavorite = !this.isFavorite;
      this.successMessage = this.isFavorite ? 'Добавлено в избранное ❤️' : 'Убрано из избранного';
      this.cdr.detectChanges();
    }
  }

  async submitReview() {
    if (!this.product || !this.reviewRating) {
      this.errorMessage = 'Поставь оценку от 1 до 5.';
      this.cdr.detectChanges();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch('http://127.0.0.1:8000/api/products/' + this.product.id + '/reviews/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        rating: this.reviewRating,
        comment: this.reviewComment
      })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      this.errorMessage = result.error || 'Не удалось сохранить отзыв';
      this.cdr.detectChanges();
      return;
    }

    this.successMessage = 'Отзыв сохранён';
    await this.loadProduct();
  }

  formatRating(value: number): string {
    return Number(value || 0).toFixed(1);
  }

  openProduct(productId: number) {
    this.router.navigate(['/product', productId]).then(() => {
      window.location.reload();
    });
  }

  goBack() {
    if (this.product?.branch) {
      this.router.navigate(['/menu', this.product.branch]);
    } else {
      this.router.navigate(['/branches']);
    }
  }

  openCart() {
    this.router.navigate(['/cart']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}