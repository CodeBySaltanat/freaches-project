import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart';

interface ProductImage {
  image_url: string;
}

interface ProductReview {
  user_name: string;
  rating: number;
  comment?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: number;
  branch: number;
  avg_rating?: number;
  reviews_count?: number;
  reviews?: ProductReview[];
  images?: ProductImage[];
  is_available?: boolean;
  branch_name?: string;
}

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page" *ngIf="loading">
      <div class="state">Загружаю товар...</div>
    </div>

    <div class="page" *ngIf="!loading && product">
      <div class="hero">
        <div class="hero__text">
          <span class="badge">{{ productCategoryName }}</span>
          <h1>{{ product.name }}</h1>
          <p>
            Подробная страница товара с галереей, отзывами, рейтингом и быстрым добавлением в корзину.
          </p>
        </div>

        <div class="hero__actions">
          <button class="ghost-btn" (click)="goBack()">Назад</button>
          <button class="primary-top-btn" (click)="openCart()">Корзина ({{ getCartCount() }})</button>
          <button class="dark-btn" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state error" *ngIf="errorMessage">{{ errorMessage }}</div>
      <div class="state success" *ngIf="successMessage">{{ successMessage }}</div>

      <div class="product-layout">
        <section class="gallery-card">
          <div class="main-image-wrap">
            <img
              class="main-image"
              [src]="getCurrentImage()"
              [alt]="product.name"
            />

            <button
              class="gallery-nav prev"
              *ngIf="(product.images?.length || 0) > 1"
              (click)="prevMainImage($event)"
            >
              ‹
            </button>

            <button
              class="gallery-nav next"
              *ngIf="(product.images?.length || 0) > 1"
              (click)="nextMainImage($event)"
            >
              ›
            </button>
          </div>

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
        </section>

        <section class="info-card">
          <div class="chips">
            <span class="category-chip">{{ productCategoryName }}</span>
            <span class="stock-chip" [class.out]="product.is_available === false">
              {{ product.is_available === false ? 'Нет в наличии' : 'В наличии' }}
            </span>
          </div>

          <div class="rating-line">
            <span class="rating-value">{{ formatRating(product.avg_rating) }} ⭐</span>
            <span class="rating-count">{{ product.reviews_count || 0 }} отзывов</span>
          </div>

          <p class="description">{{ product.description }}</p>

          <div class="price">{{ product.price }} ₸</div>

          <div class="actions">
            <ng-container *ngIf="product.is_available !== false; else unavailableTpl">
              <button
                class="cart-btn"
                *ngIf="getItemCount(product.id) === 0"
                (click)="addToCart(product)"
              >
                В корзину
              </button>

              <div class="qty-box" *ngIf="getItemCount(product.id) > 0">
                <button class="qty-btn" (click)="decreaseQty(product.id)">−</button>
                <span class="qty-value">{{ getItemCount(product.id) }}</span>
                <button class="qty-btn" (click)="increaseQty(product.id)">+</button>
              </div>
            </ng-container>

            <ng-template #unavailableTpl>
              <div class="unavailable">Нет в наличии</div>
            </ng-template>

            <button class="favorite-btn" [class.active]="isFavorite" (click)="toggleFavorite()">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 20s-6.5-4.2-8.6-8C1.7 9.2 3 5.8 6.4 5.1A4.7 4.7 0 0 1 12 7.2a4.7 4.7 0 0 1 5.6-2.1c3.4.7 4.7 4.1 3 6.9C18.5 15.8 12 20 12 20Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  [attr.fill]="isFavorite ? 'currentColor' : 'none'"
                  stroke-linejoin="round"
                />
              </svg>
              <span>{{ isFavorite ? 'В избранном' : 'В избранное' }}</span>
            </button>
          </div>
        </section>
      </div>

      <section class="block" *ngIf="similarProducts.length > 0">
        <h2>Похожие товары</h2>

        <div class="similar-grid">
          <article
            class="similar-card"
            *ngFor="let item of similarProducts"
            (click)="openProduct(item.id)"
          >
            <img
              [src]="getCardImage(item)"
              [alt]="item.name"
            />
            <strong>{{ item.name }}</strong>
            <span>{{ item.price }} ₸</span>
          </article>
        </div>
      </section>

      <section class="block">
        <h2>Отзывы</h2>

        <div class="review-form">
          <label>Твоя оценка</label>

          <div class="stars">
            <button
              type="button"
              class="star-btn"
              *ngFor="let star of starOptions"
              [class.active]="reviewRating >= star"
              (click)="reviewRating = star"
            >
              ★
            </button>
          </div>

          <label>Твой отзыв</label>
          <textarea
            [(ngModel)]="reviewComment"
            rows="4"
            placeholder="Напиши отзыв"
          ></textarea>

          <button class="submit-review" (click)="submitReview()">Сохранить отзыв</button>
        </div>

        <div class="review-list" *ngIf="product.reviews?.length; else noReviewsTpl">
          <div class="review-item" *ngFor="let review of product.reviews">
            <div class="review-head">
              <strong>{{ review.user_name }}</strong>
              <span>{{ review.rating }} ⭐</span>
            </div>
            <p>{{ review.comment || 'Без текста' }}</p>
          </div>
        </div>

        <ng-template #noReviewsTpl>
          <div class="empty">Пока отзывов нет.</div>
        </ng-template>
      </section>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      padding: 40px;
      background:
        radial-gradient(circle at 10% 18%, rgba(52, 116, 255, 0.07), transparent 24%),
        radial-gradient(circle at 92% 80%, rgba(90, 187, 255, 0.09), transparent 22%),
        linear-gradient(180deg, #f8fafc 0%, #f3f7fc 100%);
      font-family: Inter, Arial, sans-serif;
      box-sizing: border-box;
      max-width: 1380px;
      margin: 0 auto;
    }

    .hero {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 24px;
      margin-bottom: 28px;
      flex-wrap: wrap;
    }

    .hero__text {
      max-width: 760px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 10px 16px;
      border-radius: 999px;
      background: rgba(38, 99, 255, 0.08);
      color: #2459e6;
      font-weight: 800;
      font-size: 14px;
      border: 1px solid rgba(38, 99, 255, 0.14);
      box-shadow: 0 8px 18px rgba(37, 89, 230, 0.05);
    }

    h1 {
      margin: 14px 0 10px;
      font-size: 58px;
      line-height: 0.98;
      letter-spacing: -1.6px;
      color: #111827;
      font-weight: 900;
    }

    h2 {
      margin: 0 0 16px;
      font-size: 28px;
      color: #172335;
      font-weight: 900;
    }

    p {
      margin: 0;
      color: #5c6c86;
      line-height: 1.65;
    }

    .hero__actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .ghost-btn,
    .primary-top-btn,
    .dark-btn,
    .cart-btn,
    .submit-review,
    .favorite-btn {
      border: none;
      border-radius: 16px;
      padding: 13px 16px;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
      font-family: inherit;
    }

    .ghost-btn {
      background: rgba(255, 255, 255, 0.88);
      color: #22324a;
      border: 1px solid #dfe7f2;
      box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
    }

    .primary-top-btn,
    .cart-btn,
    .submit-review {
      background: linear-gradient(135deg, #2f6cff, #57b8ff);
      color: white;
      box-shadow: 0 14px 28px rgba(47, 108, 255, 0.22);
    }

    .dark-btn {
      background: #1f2937;
      color: white;
    }

    .ghost-btn:hover,
    .primary-top-btn:hover,
    .dark-btn:hover,
    .cart-btn:hover,
    .submit-review:hover,
    .favorite-btn:hover,
    .gallery-nav:hover,
    .similar-card:hover {
      transform: translateY(-1px);
    }

    .state,
    .gallery-card,
    .info-card,
    .block {
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid #e4ebf5;
      border-radius: 26px;
      box-shadow:
        0 18px 36px rgba(15, 23, 42, 0.06),
        0 6px 16px rgba(15, 23, 42, 0.03);
    }

    .state {
      padding: 18px 20px;
      margin-bottom: 20px;
      font-weight: 700;
      color: #31415d;
    }

    .state.error {
      color: #b42318;
      background: #fff1f0;
      border-color: #ffd7d2;
    }

    .state.success {
      color: #027a48;
      background: #ecfdf3;
      border-color: #c7f0d7;
    }

    .product-layout {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .gallery-card,
    .info-card,
    .block {
      padding: 20px;
    }

    .main-image-wrap {
      position: relative;
    }

    .main-image {
      width: 100%;
      height: 470px;
      object-fit: cover;
      border-radius: 20px;
      background: linear-gradient(135deg, #edf4ff, #f8fbff);
      display: block;
      border: 1px solid #e2ebf8;
    }

    .gallery-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 42px;
      height: 42px;
      border: none;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.58);
      color: white;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    }

    .prev {
      left: 12px;
    }

    .next {
      right: 12px;
    }

    .thumbs {
      display: flex;
      gap: 10px;
      margin-top: 14px;
      flex-wrap: wrap;
    }

    .thumb {
      width: 92px;
      height: 74px;
      object-fit: cover;
      border-radius: 12px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.18s ease, transform 0.18s ease;
    }

    .thumb:hover {
      transform: translateY(-1px);
    }

    .thumb.active {
      border-color: #2f6cff;
      box-shadow: 0 8px 18px rgba(47, 108, 255, 0.16);
    }

    .chips {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .category-chip,
    .stock-chip {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 7px 11px;
      font-size: 12px;
      font-weight: 800;
    }

    .category-chip {
      background: rgba(47, 108, 255, 0.08);
      color: #2459e6;
      border: 1px solid rgba(47, 108, 255, 0.12);
    }

    .stock-chip {
      background: #ecfdf3;
      color: #027a48;
      border: 1px solid #c7f0d7;
    }

    .stock-chip.out {
      background: #eef2f7;
      color: #556173;
      border: 1px solid #d8e1eb;
    }

    .rating-line {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .rating-value {
      font-weight: 900;
      color: #111827;
    }

    .rating-count {
      color: #73839a;
      font-size: 14px;
    }

    .description {
      color: #5c6c86;
      margin-bottom: 18px;
      line-height: 1.65;
    }

    .price {
      font-size: 30px;
      font-weight: 900;
      margin-bottom: 18px;
      color: #111827;
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
      background: rgba(47, 108, 255, 0.08);
      border-radius: 999px;
      padding: 8px 12px;
      border: 1px solid rgba(47, 108, 255, 0.10);
    }

    .qty-btn {
      width: 34px;
      height: 34px;
      border: none;
      border-radius: 999px;
      background: linear-gradient(135deg, #2f6cff, #57b8ff);
      color: white;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      box-shadow: 0 10px 18px rgba(47, 108, 255, 0.18);
    }

    .qty-value {
      min-width: 18px;
      text-align: center;
      font-weight: 900;
      color: #111827;
    }

    .unavailable {
      background: #eef2f7;
      color: #556173;
      padding: 12px 16px;
      border-radius: 14px;
      font-weight: 800;
      border: 1px solid #d8e1eb;
    }

    .favorite-btn {
      background: rgba(255, 255, 255, 0.88);
      color: #22324a;
      border: 1px solid #dfe7f2;
      box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    .favorite-btn svg {
      width: 18px;
      height: 18px;
      display: block;
    }

    .favorite-btn.active {
      color: #ff5b7f;
      border-color: #ffd0da;
      background: #fff7fa;
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
      background: #f8fbff;
      border: 1px solid #e5edf8;
      border-radius: 18px;
      padding: 12px;
      cursor: pointer;
      box-sizing: border-box;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    }

    .similar-card:hover {
      border-color: #d2e1fb;
      box-shadow: 0 14px 24px rgba(15, 23, 42, 0.08);
    }

    .similar-card img {
      width: 100%;
      height: 160px;
      object-fit: cover;
      border-radius: 14px;
      margin-bottom: 10px;
      display: block;
      background: linear-gradient(135deg, #edf4ff, #f8fbff);
      border: 1px solid #e2ebf8;
    }

    .similar-card strong,
    .similar-card span {
      display: block;
    }

    .similar-card strong {
      color: #172335;
      margin-bottom: 4px;
    }

    .similar-card span {
      color: #6b7c94;
    }

    .review-form {
      margin-bottom: 18px;
    }

    .review-form label {
      display: block;
      font-weight: 800;
      margin-bottom: 8px;
      color: #1d2940;
    }

    .stars {
      display: flex;
      gap: 6px;
      margin-bottom: 12px;
    }

    .star-btn {
      background: transparent;
      color: #c9d2df;
      font-size: 28px;
      padding: 0;
      border: none;
      width: auto;
      cursor: pointer;
    }

    .star-btn.active {
      color: #ffb020;
    }

    textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 13px 14px;
      border: 1px solid #d8e4ff;
      background: #f9fbff;
      border-radius: 14px;
      font-size: 15px;
      font-family: inherit;
      resize: vertical;
      margin-bottom: 12px;
      outline: none;
      color: #0f172a;
    }

    textarea:focus {
      border-color: #6d9cff;
      box-shadow: 0 0 0 4px rgba(91, 140, 255, 0.14);
      background: white;
    }

    .review-list {
      display: grid;
      gap: 10px;
    }

    .review-item {
      background: #f8fbff;
      border: 1px solid #e5edf8;
      border-radius: 14px;
      padding: 12px;
    }

    .review-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 6px;
    }

    .review-head strong {
      color: #1b2940;
    }

    .empty {
      color: #73839a;
      font-weight: 700;
    }

    @media (max-width: 980px) {
      .page {
        padding: 24px 18px;
      }

      .hero {
        flex-direction: column;
        align-items: start;
      }

      h1 {
        font-size: 42px;
        line-height: 1;
        letter-spacing: -1px;
      }

      .hero__actions {
        width: 100%;
      }

      .hero__actions button {
        flex: 1 1 auto;
      }

      .product-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  similarProducts: Product[] = [];
  categories: Category[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';
  selectedImageIndex = 0;
  isFavorite = false;
  reviewRating = 0;
  reviewComment = '';
  readonly starOptions = [1, 2, 3, 4, 5];

  private routeSub?: Subscription;
  private successTimer?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('role') !== 'buyer') {
      this.router.navigate(['/orders']);
      return;
    }

    this.routeSub = this.route.paramMap.subscribe((params: ParamMap) => {
      const id = Number(params.get('id'));
      if (!id) {
        this.loading = false;
        this.errorMessage = 'Товар не найден.';
        this.cdr.detectChanges();
        return;
      }

      this.loadProduct(id);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    if (this.successTimer) {
      window.clearTimeout(this.successTimer);
    }
  }

  get productCategoryName(): string {
    if (!this.product) return 'Без категории';
    const category = this.categories.find((item) => Number(item.id) === Number(this.product?.category));
    return category ? category.name : 'Без категории';
  }

  async loadProduct(id: number): Promise<void> {
    try {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.selectedImageIndex = 0;
      this.cdr.detectChanges();

      const token = localStorage.getItem('token') || '';

      const productResponse = await fetch('http://127.0.0.1:8000/api/products/' + id + '/');
      if (!productResponse.ok) {
        throw new Error('Не удалось загрузить товар');
      }

      const productData = await productResponse.json();

      const requests: Promise<Response>[] = [
        fetch('http://127.0.0.1:8000/api/categories/'),
        fetch('http://127.0.0.1:8000/api/products/?branch=' + productData.branch)
      ];

      if (token) {
        requests.push(
          fetch('http://127.0.0.1:8000/api/favorites/', {
            headers: { Authorization: 'Bearer ' + token }
          })
        );
      }

      const responses = await Promise.all(requests);

      const categoriesResponse = responses[0];
      const similarResponse = responses[1];
      const favoritesResponse = responses[2];

      if (!categoriesResponse.ok) {
        throw new Error('Не удалось загрузить категории');
      }

      if (!similarResponse.ok) {
        throw new Error('Не удалось загрузить похожие товары');
      }

      const categoriesData = await categoriesResponse.json();
      const similarData = await similarResponse.json();
      const favoritesData = favoritesResponse?.ok ? await favoritesResponse.json() : [];

      this.product = productData;
      this.categories = Array.isArray(categoriesData) ? categoriesData : [];

      this.similarProducts = (Array.isArray(similarData) ? similarData : [])
        .filter((item: Product) =>
          Number(item.id) !== Number(productData.id) &&
          Number(item.category) === Number(productData.category)
        )
        .slice(0, 4);

      this.isFavorite = (Array.isArray(favoritesData) ? favoritesData : []).some(
        (item: any) => Number(item.id) === Number(productData.id)
      );

      const myReview = (productData.reviews || []).find(
        (review: ProductReview) => review.user_name === localStorage.getItem('username')
      );

      if (myReview) {
        this.reviewRating = myReview.rating;
        this.reviewComment = myReview.comment || '';
      } else {
        this.reviewRating = 0;
        this.reviewComment = '';
      }

      this.loading = false;
      this.cdr.detectChanges();
    } catch (error) {
      this.loading = false;
      this.errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки товара';
      this.cdr.detectChanges();
    }
  }

  getCurrentImage(): string {
    if (!this.product) {
      return 'https://picsum.photos/seed/noimage/900/700';
    }

    return this.product.images?.[this.selectedImageIndex]?.image_url || this.getFallbackImage(this.product);
  }

  getCardImage(item: Product): string {
    return item.images?.[0]?.image_url || this.getFallbackImage(item);
  }

  getFallbackImage(item: Product): string {
    const name = String(item.name || '').toLowerCase();

    if (name.includes('chicken sandwich')) {
      return './assets/products/chicken-sandwich.jpg';
    }

    if (name.includes('beef sandwich')) {
      return './assets/products/beef-sandwich.jpg';
    }

    if (name.includes('beef burger')) {
      return './assets/products/beef-burger.jpg';
    }

    if (name.includes('burger')) {
      return './assets/products/beef-burger.jpg';
    }

    if (name.includes('sandwich')) {
      return './assets/products/beef-sandwich.jpg';
    }

    return './assets/products/default-food.jpg';
  }

  prevMainImage(event: Event): void {
    event.stopPropagation();

    const total = this.product?.images?.length || 0;
    if (total <= 1) return;

    this.selectedImageIndex = this.selectedImageIndex === 0
      ? total - 1
      : this.selectedImageIndex - 1;

    this.cdr.detectChanges();
  }

  nextMainImage(event: Event): void {
    event.stopPropagation();

    const total = this.product?.images?.length || 0;
    if (total <= 1) return;

    this.selectedImageIndex = this.selectedImageIndex === total - 1
      ? 0
      : this.selectedImageIndex + 1;

    this.cdr.detectChanges();
  }

  getCartCount(): number {
    return this.cartService.getTotalCount();
  }

  getItemCount(productId: number): number {
    return this.cartService.getItemCount(productId);
  }

  addToCart(item: Product): void {
    if (item.is_available === false) return;

    this.cartService.addItem(item as any);
    this.showSuccess(item.name + ' добавлен в корзину');
    this.cdr.detectChanges();
  }

  increaseQty(productId: number): void {
    this.cartService.increaseItem(productId);
    this.cdr.detectChanges();
  }

  decreaseQty(productId: number): void {
    this.cartService.decreaseItem(productId);
    this.cdr.detectChanges();
  }

  async toggleFavorite(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token || !this.product) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/favorites/' + this.product.id + '/', {
        method: this.isFavorite ? 'DELETE' : 'POST',
        headers: { Authorization: 'Bearer ' + token }
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить избранное');
      }

      this.isFavorite = !this.isFavorite;
      this.showSuccess(this.isFavorite ? 'Добавлено в избранное' : 'Убрано из избранного');
      this.cdr.detectChanges();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Ошибка избранного.';
      this.cdr.detectChanges();
    }
  }

  async submitReview(): Promise<void> {
    if (!this.product || !this.reviewRating) {
      this.errorMessage = 'Поставь оценку от 1 до 5.';
      this.cdr.detectChanges();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/products/' + this.product.id + '/reviews/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify({
            rating: this.reviewRating,
            comment: this.reviewComment
          })
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось сохранить отзыв');
      }

      this.showSuccess('Отзыв сохранён');
      await this.loadProduct(this.product.id);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось сохранить отзыв.';
      this.cdr.detectChanges();
    }
  }

  formatRating(value?: number): string {
    return Number(value || 0).toFixed(1);
  }

  openProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  goBack(): void {
    if (this.product?.branch) {
      this.router.navigate(['/menu', this.product.branch]);
    } else {
      this.router.navigate(['/branches']);
    }
  }

  openCart(): void {
    this.router.navigate(['/cart']);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';

    if (this.successTimer) {
      window.clearTimeout(this.successTimer);
    }

    this.successTimer = window.setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 2200);
  }
}