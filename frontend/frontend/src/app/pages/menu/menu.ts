import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="hero">
        <div class="hero__text">
          <span class="badge">{{ branchName }}</span>
          <h1>Меню филиала</h1>
          <p>
            Выбирай товары, смотри рейтинг, добавляй в избранное и оформляй заказ
            в пару кликов.
          </p>
        </div>

        <div class="hero__actions">
          <button class="ghost-btn" (click)="goBack()">Филиалы</button>
          <button class="ghost-btn" (click)="openFavorites()">Избранное</button>
          <button class="ghost-btn" (click)="openOrders()">Мои заказы</button>
          <button class="primary-top-btn" (click)="openCart()">Корзина ({{ getCartCount() }})</button>
          <button class="dark-btn" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="filters-box" *ngIf="!loading">
        <div class="filter-field">
          <label>Поиск</label>
          <input [(ngModel)]="searchTerm" placeholder="Например, Chicken burger" />
        </div>

        <div class="filter-field">
          <label>Категория</label>
          <select [(ngModel)]="selectedCategory">
            <option value="">Все категории</option>
            <option *ngFor="let category of categories; trackBy: trackByCategory" [value]="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="filter-field">
          <label>Сортировка</label>
          <select [(ngModel)]="sortBy">
            <option value="">Без сортировки</option>
            <option value="price_asc">Цена: сначала дешёвые</option>
            <option value="price_desc">Цена: сначала дорогие</option>
            <option value="rating_desc">Рейтинг: сначала лучшие</option>
            <option value="rating_asc">Рейтинг: сначала низкие</option>
            <option value="name_asc">Название: А-Я</option>
          </select>
        </div>

        <div class="filter-actions">
          <button class="clear-btn" (click)="clearFilters()">Сбросить</button>
        </div>
      </div>

      <div class="state success" *ngIf="successMessage">{{ successMessage }}</div>
      <div class="state" *ngIf="loading">Загружаю меню...</div>
      <div class="state error" *ngIf="!loading && errorMessage">{{ errorMessage }}</div>

      <div
        class="state"
        *ngIf="!loading && !errorMessage && filteredProducts.length === 0"
      >
        Ничего не найдено по выбранным фильтрам.
      </div>

      <div class="grid" *ngIf="!loading && !errorMessage && filteredProducts.length > 0">
        <article
          class="card clickable-card"
          *ngFor="let item of filteredProducts; trackBy: trackByProduct"
          (click)="openProduct(item.id)"
        >
          <div class="carousel">
            <ng-container *ngIf="item.images?.length; else noImageTpl">
              <img
                class="product-image"
                [src]="item.images?.[getImageIndex(item.id)]?.image_url || fallbackImage"
                [alt]="item.name"
              />

              <button
                class="nav prev"
                *ngIf="(item.images?.length || 0) > 1"
                (click)="prevImage(item.id, item.images!.length, $event)"
              >
                ‹
              </button>

              <button
                class="nav next"
                *ngIf="(item.images?.length || 0) > 1"
                (click)="nextImage(item.id, item.images!.length, $event)"
              >
                ›
              </button>
            </ng-container>

            <ng-template #noImageTpl>
              <div class="no-image">Нет фото</div>
            </ng-template>

            <button
              class="favorite-btn"
              [class.active]="isFavorite(item.id)"
              (click)="toggleFavorite(item.id, $event)"
              aria-label="Избранное"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 20s-6.5-4.2-8.6-8C1.7 9.2 3 5.8 6.4 5.1A4.7 4.7 0 0 1 12 7.2a4.7 4.7 0 0 1 5.6-2.1c3.4.7 4.7 4.1 3 6.9C18.5 15.8 12 20 12 20Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  [attr.fill]="isFavorite(item.id) ? 'currentColor' : 'none'"
                />
              </svg>
            </button>
          </div>

          <div class="meta-row">
            <div class="category-chip">{{ getCategoryName(item.category) }}</div>
            <div class="stock-chip" [class.out]="item.is_available === false">
              {{ item.is_available === false ? 'Нет в наличии' : 'В наличии' }}
            </div>
          </div>

          <h3>{{ item.name }}</h3>

          <div class="rating-line">
            <span class="rating-value">{{ formatRating(item.avg_rating) }} ⭐</span>
            <span class="rating-count">({{ item.reviews_count || 0 }} отзывов)</span>
          </div>

          <p class="desc">{{ item.description }}</p>
          <div class="price">{{ item.price }} ₸</div>

          <div class="bottom-row">
            <ng-container *ngIf="item.is_available !== false; else unavailableTpl">
              <button
                class="cart-btn"
                *ngIf="getItemCount(item.id) === 0"
                (click)="addToCart(item, $event)"
              >
                В корзину
              </button>

              <div class="qty-box" *ngIf="getItemCount(item.id) > 0" (click)="$event.stopPropagation()">
                <button class="qty-btn" (click)="decreaseQty(item.id, $event)">−</button>
                <span class="qty-value">{{ getItemCount(item.id) }}</span>
                <button class="qty-btn" (click)="increaseQty(item.id, $event)">+</button>
              </div>
            </ng-container>

            <ng-template #unavailableTpl>
              <div class="unavailable">Нет в наличии</div>
            </ng-template>
          </div>

          <div class="similar-box" *ngIf="getSimilarProducts(item).length > 0">
            <div class="similar-title">Похожие товары</div>

            <div class="similar-list">
              <div class="similar-item" *ngFor="let similar of getSimilarProducts(item); trackBy: trackByProduct">
                <div class="similar-info">
                  <strong>{{ similar.name }}</strong>
                  <span>{{ similar.price }} ₸</span>
                </div>

                <button
                  class="mini-btn"
                  *ngIf="similar.is_available !== false"
                  (click)="addToCart(similar, $event)"
                >
                  +
                </button>

                <span class="mini-unavailable" *ngIf="similar.is_available === false">Нет</span>
              </div>
            </div>
          </div>

          <button class="reviews-toggle" (click)="toggleReviews(item.id, $event)">
            {{ isReviewsOpen(item.id) ? 'Скрыть отзывы' : 'Отзывы и рейтинг' }}
          </button>

          <div class="reviews-box" *ngIf="isReviewsOpen(item.id)" (click)="$event.stopPropagation()">
            <div class="review-form" *ngIf="role === 'buyer'">
              <label>Твоя оценка</label>

              <div class="stars">
                <button
                  type="button"
                  class="star-btn"
                  *ngFor="let star of starOptions"
                  [class.active]="getSelectedRating(item.id) >= star"
                  (click)="setRating(item.id, star, $event)"
                >
                  ★
                </button>
              </div>

              <label>Твой отзыв</label>
              <textarea
                [ngModel]="getReviewComment(item.id)"
                (ngModelChange)="setReviewComment(item.id, $event)"
                rows="3"
                placeholder="Напиши честный отзыв"
              ></textarea>

              <button class="submit-review" (click)="submitReview(item.id)">
                Сохранить отзыв
              </button>
            </div>

            <div class="review-list" *ngIf="item.reviews?.length; else emptyReviewsTpl">
              <div class="review-item" *ngFor="let review of item.reviews">
                <div class="review-head">
                  <strong>{{ review.user_name }}</strong>
                  <span>{{ review.rating }} ⭐</span>
                </div>
                <p>{{ review.comment || 'Без текста' }}</p>
              </div>
            </div>

            <ng-template #emptyReviewsTpl>
              <div class="empty-reviews">Пока отзывов нет.</div>
            </ng-template>
          </div>
        </article>
      </div>
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
      max-width: 720px;
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
    .clear-btn {
      border: none;
      border-radius: 16px;
      padding: 13px 16px;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
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

    .dark-btn,
    .clear-btn,
    .reviews-toggle {
      background: #1f2937;
      color: white;
    }

    .ghost-btn:hover,
    .primary-top-btn:hover,
    .dark-btn:hover,
    .cart-btn:hover,
    .submit-review:hover,
    .clear-btn:hover,
    .reviews-toggle:hover,
    .favorite-btn:hover,
    .nav:hover {
      transform: translateY(-1px);
    }

    .filters-box {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      background: rgba(255, 255, 255, 0.94);
      border-radius: 24px;
      padding: 20px;
      margin-bottom: 22px;
      border: 1px solid #e2e9f4;
      box-shadow:
        0 18px 36px rgba(15, 23, 42, 0.06),
        0 6px 16px rgba(15, 23, 42, 0.03);
      backdrop-filter: blur(10px);
    }

    .filter-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-field label,
    .review-form label {
      font-size: 14px;
      font-weight: 800;
      color: #1d2940;
    }

    .filter-field input,
    .filter-field select,
    textarea {
      padding: 13px 14px;
      border: 1px solid #d8e4ff;
      background: #f9fbff;
      border-radius: 14px;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      font-family: inherit;
      color: #0f172a;
    }

    .filter-field input:focus,
    .filter-field select:focus,
    textarea:focus {
      border-color: #6d9cff;
      box-shadow: 0 0 0 4px rgba(91, 140, 255, 0.14);
      background: white;
    }

    .filter-actions {
      display: flex;
      align-items: end;
    }

    .clear-btn {
      width: 100%;
    }

    .state {
      background: rgba(255, 255, 255, 0.94);
      border-radius: 20px;
      padding: 18px 20px;
      margin-bottom: 20px;
      border: 1px solid #e3eaf4;
      box-shadow: 0 14px 28px rgba(15, 23, 42, 0.04);
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

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }

    .card {
      background: rgba(255, 255, 255, 0.96);
      border-radius: 26px;
      padding: 18px;
      border: 1px solid #e4ebf5;
      box-shadow:
        0 18px 36px rgba(15, 23, 42, 0.06),
        0 6px 16px rgba(15, 23, 42, 0.03);
    }

    .clickable-card {
      cursor: pointer;
      transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    }

    .clickable-card:hover {
      transform: translateY(-3px);
      border-color: #d2e1fb;
      box-shadow:
        0 24px 42px rgba(15, 23, 42, 0.09),
        0 8px 18px rgba(15, 23, 42, 0.04);
    }

    .carousel {
      position: relative;
      margin-bottom: 16px;
    }

    .product-image,
    .no-image {
      width: 100%;
      height: 230px;
      object-fit: cover;
      border-radius: 18px;
      display: block;
      background: linear-gradient(135deg, #edf4ff, #f8fbff);
      border: 1px solid #e2ebf8;
    }

    .no-image {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #7687a0;
      font-weight: 800;
    }

    .nav,
    .favorite-btn {
      position: absolute;
      border: none;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
    }

    .nav {
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.58);
      color: white;
      font-size: 24px;
      line-height: 1;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    }

    .prev { left: 10px; }
    .next { right: 10px; }

    .favorite-btn {
      top: 10px;
      right: 10px;
      width: 42px;
      height: 42px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.94);
      color: #8fa0bb;
      box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
    }

    .favorite-btn svg {
      width: 20px;
      height: 20px;
      display: block;
    }

    .favorite-btn.active {
      color: #ff5b7f;
      background: white;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 10px;
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

    .card h3 {
      margin: 0 0 8px;
      font-size: 22px;
      line-height: 1.2;
      color: #172335;
      font-weight: 900;
    }

    .rating-line {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 10px;
    }

    .rating-value {
      font-weight: 900;
      color: #111827;
    }

    .rating-count {
      color: #73839a;
      font-size: 14px;
    }

    .desc {
      min-height: 48px;
      margin-bottom: 18px;
      color: #6b7c94;
    }

    .price {
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 16px;
      color: #111827;
    }

    .bottom-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
      flex-wrap: wrap;
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

    .similar-box {
      background: #f7faff;
      border: 1px solid #dfe9fb;
      border-radius: 18px;
      padding: 14px;
      margin-bottom: 14px;
    }

    .similar-title {
      font-weight: 900;
      margin-bottom: 10px;
      color: #172335;
    }

    .similar-list {
      display: grid;
      gap: 8px;
    }

    .similar-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      background: white;
      border-radius: 14px;
      padding: 10px 12px;
      border: 1px solid #e7eef8;
    }

    .similar-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .similar-info strong {
      color: #1b2940;
    }

    .similar-info span {
      color: #6b7c94;
      font-size: 14px;
    }

    .mini-btn {
      width: 38px;
      height: 38px;
      border: none;
      border-radius: 999px;
      background: linear-gradient(135deg, #2f6cff, #57b8ff);
      color: white;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      box-shadow: 0 10px 18px rgba(47, 108, 255, 0.16);
    }

    .mini-unavailable {
      background: #eef2f7;
      color: #556173;
      border-radius: 999px;
      padding: 8px 10px;
      font-size: 12px;
      font-weight: 800;
    }

    .reviews-toggle {
      width: 100%;
      border: none;
      border-radius: 16px;
      padding: 12px 16px;
      font-weight: 800;
      cursor: pointer;
      margin-bottom: 14px;
      transition: transform 0.18s ease;
    }

    .reviews-box {
      border-top: 1px solid #ebf0f7;
      padding-top: 14px;
      cursor: default;
    }

    .review-form {
      margin-bottom: 16px;
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
      resize: vertical;
      margin-bottom: 12px;
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

    .empty-reviews {
      color: #73839a;
      font-size: 14px;
      font-weight: 700;
    }

    @media (max-width: 900px) {
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

      .grid {
        grid-template-columns: 1fr;
      }

      .filters-box {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MenuComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: Category[] = [];
  branchId = 0;
  branchName = 'Филиал';
  loading = true;
  errorMessage = '';
  successMessage = '';

  imageIndexes: Record<number, number> = {};
  openReviews: Record<number, boolean> = {};
  reviewDrafts: Record<number, { rating: number; comment: string }> = {};
  favoriteIds = new Set<number>();

  searchTerm = '';
  selectedCategory = '';
  sortBy = '';

  readonly starOptions = [1, 2, 3, 4, 5];
  readonly fallbackImage = 'https://picsum.photos/seed/noimage/600/400';

  readonly role = localStorage.getItem('role') || 'buyer';
  readonly username = localStorage.getItem('username') || '';

  private successTimer?: number;

  constructor(
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.role !== 'buyer') {
      this.router.navigate(['/orders']);
      return;
    }

    this.branchId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.branchId) {
      this.errorMessage = 'Филиал не найден.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadAll();
  }

  ngOnDestroy(): void {
    if (this.successTimer) {
      window.clearTimeout(this.successTimer);
    }
  }

  trackByProduct = (_: number, item: Product) => item.id;
  trackByCategory = (_: number, item: Category) => item.id;

  async loadAll(): Promise<void> {
    try {
      const token = localStorage.getItem('token') || '';

      const [productsResponse, categoriesResponse, favoritesResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/products/?branch=' + this.branchId),
        fetch('http://127.0.0.1:8000/api/categories/'),
        fetch('http://127.0.0.1:8000/api/favorites/', {
          headers: { 'Authorization': 'Bearer ' + token }
        })
      ]);

      if (!productsResponse.ok) throw new Error('Не удалось загрузить меню');
      if (!categoriesResponse.ok) throw new Error('Не удалось загрузить категории');
      if (!favoritesResponse.ok) throw new Error('Не удалось загрузить избранное');

      const productsData = await productsResponse.json();
      const categoriesData = await categoriesResponse.json();
      const favoritesData = await favoritesResponse.json();

      this.products = Array.isArray(productsData) ? productsData : [];
      this.categories = Array.isArray(categoriesData) ? categoriesData : [];
      this.favoriteIds = new Set(
        Array.isArray(favoritesData) ? favoritesData.map((item: any) => Number(item.id)) : []
      );

      if (this.products.length > 0) {
        this.branchName = this.products[0].branch_name || ('Филиал #' + this.branchId);
      } else {
        this.branchName = 'Филиал #' + this.branchId;
      }

      for (const product of this.products) {
        const myReview = (product.reviews || []).find(
          (review) => review.user_name === this.username
        );

        this.reviewDrafts[product.id] = myReview
          ? { rating: myReview.rating, comment: myReview.comment || '' }
          : { rating: 0, comment: '' };
      }

      this.loading = false;
      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить меню.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  get filteredProducts(): Product[] {
    let result = [...this.products];

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((product) =>
        String(product.name || '').toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory) {
      result = result.filter(
        (product) => String(product.category) === String(this.selectedCategory)
      );
    }

    switch (this.sortBy) {
      case 'price_asc':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'rating_desc':
        result.sort((a, b) => Number(b.avg_rating || 0) - Number(a.avg_rating || 0));
        break;
      case 'rating_asc':
        result.sort((a, b) => Number(a.avg_rating || 0) - Number(b.avg_rating || 0));
        break;
      case 'name_asc':
        result.sort((a, b) => String(a.name).localeCompare(String(b.name)));
        break;
    }

    return result;
  }

  getSimilarProducts(product: Product): Product[] {
    return this.products
      .filter((item) =>
        item.id !== product.id &&
        Number(item.category) === Number(product.category) &&
        Number(item.branch) === Number(product.branch)
      )
      .slice(0, 3);
  }

  async toggleFavorite(productId: number, event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const isNowFavorite = this.isFavorite(productId);

      const response = await fetch('http://127.0.0.1:8000/api/favorites/' + productId + '/', {
        method: isNowFavorite ? 'DELETE' : 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить избранное');
      }

      if (isNowFavorite) {
        this.favoriteIds.delete(productId);
        this.showSuccess('Убрано из избранного');
      } else {
        this.favoriteIds.add(productId);
        this.showSuccess('Добавлено в избранное');
      }

      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (error) {
      this.successMessage = '';
      this.errorMessage = error instanceof Error ? error.message : 'Ошибка избранного.';
      this.cdr.detectChanges();
    }
  }

  isFavorite(productId: number): boolean {
    return this.favoriteIds.has(Number(productId));
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.sortBy = '';
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((item) => Number(item.id) === Number(categoryId));
    return category ? category.name : 'Без категории';
  }

  formatRating(value?: number): string {
    return Number(value || 0).toFixed(1);
  }

  getImageIndex(productId: number): number {
    return this.imageIndexes[productId] || 0;
  }

  prevImage(productId: number, total: number, event: Event): void {
    event.stopPropagation();
    const current = this.getImageIndex(productId);
    this.imageIndexes[productId] = current === 0 ? total - 1 : current - 1;
    this.cdr.detectChanges();
  }

  nextImage(productId: number, total: number, event: Event): void {
    event.stopPropagation();
    const current = this.getImageIndex(productId);
    this.imageIndexes[productId] = current === total - 1 ? 0 : current + 1;
    this.cdr.detectChanges();
  }

  openProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  addToCart(item: Product, event?: Event): void {
    event?.stopPropagation();

    if (item.is_available === false) return;

    this.cartService.addItem(item as any);
    this.showSuccess(item.name + ' добавлен в корзину');
    this.cdr.detectChanges();
  }

  increaseQty(productId: number, event?: Event): void {
    event?.stopPropagation();
    this.cartService.increaseItem(productId);
    this.cdr.detectChanges();
  }

  decreaseQty(productId: number, event?: Event): void {
    event?.stopPropagation();
    this.cartService.decreaseItem(productId);
    this.cdr.detectChanges();
  }

  getCartCount(): number {
    return this.cartService.getTotalCount();
  }

  getItemCount(productId: number): number {
    return this.cartService.getItemCount(productId);
  }

  toggleReviews(productId: number, event?: Event): void {
    event?.stopPropagation();
    this.openReviews[productId] = !this.openReviews[productId];

    if (!this.reviewDrafts[productId]) {
      this.reviewDrafts[productId] = { rating: 0, comment: '' };
    }

    this.cdr.detectChanges();
  }

  isReviewsOpen(productId: number): boolean {
    return !!this.openReviews[productId];
  }

  setRating(productId: number, rating: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.reviewDrafts[productId]) {
      this.reviewDrafts[productId] = { rating: 0, comment: '' };
    }

    this.reviewDrafts[productId].rating = rating;
    this.cdr.detectChanges();
  }

  getSelectedRating(productId: number): number {
    return this.reviewDrafts[productId]?.rating || 0;
  }

  getReviewComment(productId: number): string {
    return this.reviewDrafts[productId]?.comment || '';
  }

  setReviewComment(productId: number, value: string): void {
    if (!this.reviewDrafts[productId]) {
      this.reviewDrafts[productId] = { rating: 0, comment: '' };
    }
    this.reviewDrafts[productId].comment = value;
  }

  async submitReview(productId: number): Promise<void> {
    const draft = this.reviewDrafts[productId];

    if (!draft || !draft.rating) {
      this.errorMessage = 'Поставь оценку от 1 до 5.';
      this.successMessage = '';
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
        'http://127.0.0.1:8000/api/products/' + productId + '/reviews/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            rating: draft.rating,
            comment: draft.comment
          })
        }
      );

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.clear();
        this.router.navigate(['/login']);
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось сохранить отзыв');
      }

      this.errorMessage = '';
      this.showSuccess('Отзыв сохранён');
      await this.loadAll();
    } catch (error) {
      this.successMessage = '';
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось сохранить отзыв.';
      this.cdr.detectChanges();
    }
  }

  openFavorites(): void {
    this.router.navigate(['/favorites']);
  }

  openCart(): void {
    this.router.navigate(['/cart']);
  }

  openOrders(): void {
    this.router.navigate(['/orders']);
  }

  goBack(): void {
    this.router.navigate(['/branches']);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;

    if (this.successTimer) {
      window.clearTimeout(this.successTimer);
    }

    this.successTimer = window.setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 2200);
  }
}