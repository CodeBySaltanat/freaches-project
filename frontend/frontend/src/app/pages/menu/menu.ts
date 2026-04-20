import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="topbar">
        <div>
          <h1>Меню филиала</h1>
          <p>Выбирай товары, смотри рейтинг и отзывы</p>
        </div>

        <div class="topbar-actions">
          <button (click)="goBack()">Филиалы</button>
          <button (click)="openFavorites()">Избранное</button>
          <button (click)="openCart()">Корзина ({{ getCartCount() }})</button>
          <button (click)="openOrders()">Мои заказы</button>
          <button class="ghost" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="filters-box" *ngIf="!loading">
        <div class="filter-field">
          <label>Поиск</label>
          <input [(ngModel)]="searchTerm" placeholder="Например, chicken" />
        </div>

        <div class="filter-field">
          <label>Категория</label>
          <select [(ngModel)]="selectedCategory">
            <option value="">Все категории</option>
            <option *ngFor="let category of categories" [value]="category.id">
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

      <div class="state" *ngIf="!loading && !errorMessage && filteredProducts.length === 0">
        Ничего не найдено по выбранным фильтрам.
      </div>

      <div class="grid" *ngIf="!loading && !errorMessage && filteredProducts.length > 0">
        <div class="card clickable-card" *ngFor="let item of filteredProducts" (click)="openProduct(item.id)">
          <div class="carousel">
            <ng-container *ngIf="item.images?.length > 0; else noImage">
              <img
                class="product-image"
                [src]="item.images?.[getImageIndex(item.id)]?.image_url || 'https://picsum.photos/seed/noimage/600/400'"
                [alt]="item.name"
              />

              <button
                class="nav prev"
                *ngIf="item.images.length > 1"
                (click)="prevImage(item.id, item.images.length, $event)">
                ‹
              </button>

              <button
                class="nav next"
                *ngIf="item.images.length > 1"
                (click)="nextImage(item.id, item.images.length, $event)">
                ›
              </button>
            </ng-container>

            <ng-template #noImage>
              <div class="no-image">Нет фото</div>
            </ng-template>

            <button
              class="favorite-btn"
              [class.active]="isFavorite(item.id)"
              (click)="toggleFavorite(item.id, $event)">
              {{ isFavorite(item.id) ? '❤️' : '🤍' }}
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
              <button *ngIf="getItemCount(item.id) === 0" (click)="addToCart(item, $event)">В корзину</button>

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
              <div class="similar-item" *ngFor="let similar of getSimilarProducts(item)">
                <div class="similar-info">
                  <strong>{{ similar.name }}</strong>
                  <span>{{ similar.price }} ₸</span>
                </div>

                <button
                  class="mini-btn"
                  *ngIf="similar.is_available !== false"
                  (click)="addToCart(similar, $event)">
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
                  (click)="setRating(item.id, star, $event)">
                  ★
                </button>
              </div>

              <label>Твой отзыв</label>
              <textarea
                [ngModel]="getReviewComment(item.id)"
                (ngModelChange)="setReviewComment(item.id, $event)"
                rows="3"
                placeholder="Напиши честный отзыв">
              </textarea>

              <button class="submit-review" (click)="submitReview(item.id)">
                Сохранить отзыв
              </button>
            </div>

            <div class="review-list" *ngIf="item.reviews?.length > 0; else noReviews">
              <div class="review-item" *ngFor="let review of item.reviews">
                <div class="review-head">
                  <strong>{{ review.user_name }}</strong>
                  <span>{{ review.rating }} ⭐</span>
                </div>
                <p>{{ review.comment || 'Без текста' }}</p>
              </div>
            </div>

            <ng-template #noReviews>
              <div class="empty-reviews">Пока отзывов нет.</div>
            </ng-template>
          </div>
        </div>
      </div>
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

    h1 {
      margin: 0 0 8px;
      font-size: 36px;
    }

    p {
      margin: 0;
      color: #666;
    }

    .topbar-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .topbar-actions button,
    .card button,
    .submit-review {
      border: none;
      border-radius: 12px;
      padding: 12px 16px;
      background: #ff8a3d;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .topbar-actions .ghost {
      background: #333;
    }

    .filters-box {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      background: white;
      border-radius: 18px;
      padding: 20px;
      margin-bottom: 22px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
    }

    .filter-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-field label {
      font-weight: 700;
      color: #333;
    }

    .filter-field input,
    .filter-field select {
      padding: 12px 14px;
      border: 1px solid #d8d8d8;
      border-radius: 12px;
      font-size: 15px;
      background: white;
    }

    .filter-actions {
      display: flex;
      align-items: end;
    }

    .clear-btn {
      border: none;
      border-radius: 12px;
      padding: 12px 16px;
      background: #444;
      color: white;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
    }

    .state {
      background: white;
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 20px;
    }

    .state.error {
      color: #b42318;
      background: #fff1f0;
    }

    .state.success {
      color: #027a48;
      background: #ecfdf3;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 18px;
    }

    .card {
      background: white;
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
    }

    .clickable-card {
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .clickable-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 34px rgba(0,0,0,0.08);
    }

    .carousel {
      position: relative;
      margin-bottom: 16px;
    }

    .product-image,
    .no-image {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-radius: 16px;
      display: block;
      background: #f2f2f2;
    }

    .no-image {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #888;
      font-weight: 700;
    }

    .nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 38px;
      height: 38px;
      border-radius: 999px !important;
      padding: 0 !important;
      background: rgba(0, 0, 0, 0.55) !important;
      font-size: 24px;
      line-height: 1;
    }

    .prev {
      left: 10px;
    }

    .next {
      right: 10px;
    }

    .favorite-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 42px;
      height: 42px;
      border-radius: 999px !important;
      padding: 0 !important;
      background: rgba(255,255,255,0.92) !important;
      color: #ff4d6d !important;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .favorite-btn.active {
      background: white !important;
      box-shadow: 0 6px 20px rgba(0,0,0,0.12);
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

    .card h3 {
      margin: 0 0 8px;
    }

    .rating-line {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 10px;
    }

    .rating-value {
      font-weight: 800;
      color: #111;
    }

    .rating-count {
      color: #777;
      font-size: 14px;
    }

    .desc {
      min-height: 48px;
      margin-bottom: 18px;
    }

    .price {
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 16px;
      color: #111;
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
      line-height: 1;
      cursor: pointer;
    }

    .qty-value {
      min-width: 18px;
      text-align: center;
      font-weight: 800;
      color: #111;
    }

    .unavailable {
      background: #e5e7eb;
      color: #555;
      padding: 12px 16px;
      border-radius: 12px;
      font-weight: 700;
    }

    .similar-box {
      background: #fff8f3;
      border: 1px solid #ffd9bf;
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 14px;
    }

    .similar-title {
      font-weight: 800;
      margin-bottom: 10px;
      color: #111;
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
      border-radius: 12px;
      padding: 10px 12px;
    }

    .similar-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .similar-info span {
      color: #666;
      font-size: 14px;
    }

    .mini-btn {
      width: 38px;
      height: 38px;
      border-radius: 999px !important;
      padding: 0 !important;
      font-size: 22px;
      line-height: 1;
    }

    .mini-unavailable {
      background: #e5e7eb;
      color: #555;
      border-radius: 999px;
      padding: 8px 10px;
      font-size: 12px;
      font-weight: 700;
    }

    .reviews-toggle {
      background: #444 !important;
      margin-bottom: 14px;
    }

    .reviews-box {
      border-top: 1px solid #eee;
      padding-top: 14px;
      cursor: default;
    }

    .review-form {
      margin-bottom: 16px;
    }

    .review-form label {
      display: block;
      font-weight: 700;
      margin-bottom: 8px;
      color: #333;
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
      width: auto !important;
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

    .empty-reviews {
      color: #777;
      font-size: 14px;
    }
  `]
})
export class MenuComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  branchId = 0;
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

  starOptions = [1, 2, 3, 4, 5];
  role = localStorage.getItem('role') || 'buyer';
  username = localStorage.getItem('username') || '';

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

  async loadAll() {
    try {
      const token = localStorage.getItem('token');

      const [productsResponse, categoriesResponse, favoritesResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/products/?branch=' + this.branchId),
        fetch('http://127.0.0.1:8000/api/categories/'),
        fetch('http://127.0.0.1:8000/api/favorites/', {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        })
      ]);

      if (!productsResponse.ok) {
        throw new Error('Не удалось загрузить меню');
      }

      if (!categoriesResponse.ok) {
        throw new Error('Не удалось загрузить категории');
      }

      if (!favoritesResponse.ok) {
        throw new Error('Не удалось загрузить избранное');
      }

      const productsData = await productsResponse.json();
      const categoriesData = await categoriesResponse.json();
      const favoritesData = await favoritesResponse.json();

      this.products = Array.isArray(productsData) ? productsData : [];
      this.categories = Array.isArray(categoriesData) ? categoriesData : [];
      this.favoriteIds = new Set(
        Array.isArray(favoritesData) ? favoritesData.map((item: any) => Number(item.id)) : []
      );

      for (const product of this.products) {
        const myReview = (product.reviews || []).find((review: any) => review.user_name === this.username);
        if (myReview) {
          this.reviewDrafts[product.id] = {
            rating: myReview.rating,
            comment: myReview.comment || ''
          };
        } else if (!this.reviewDrafts[product.id]) {
          this.reviewDrafts[product.id] = {
            rating: 0,
            comment: ''
          };
        }
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

  get filteredProducts(): any[] {
    let result = [...this.products];

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(product =>
        String(product.name || '').toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory) {
      result = result.filter(product => String(product.category) === String(this.selectedCategory));
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

  getSimilarProducts(product: any): any[] {
    return this.products
      .filter(item =>
        Number(item.id) !== Number(product.id) &&
        Number(item.category) === Number(product.category) &&
        Number(item.branch) === Number(product.branch)
      )
      .slice(0, 3);
  }

  async toggleFavorite(productId: number, event: Event) {
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
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить избранное');
      }

      if (isNowFavorite) {
        this.favoriteIds.delete(productId);
        this.successMessage = 'Убрано из избранного';
      } else {
        this.favoriteIds.add(productId);
        this.successMessage = 'Добавлено в избранное ❤️';
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

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.sortBy = '';
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((item: any) => Number(item.id) === Number(categoryId));
    return category ? category.name : 'Без категории';
  }

  formatRating(value: number): string {
    return Number(value || 0).toFixed(1);
  }

  getImageIndex(productId: number): number {
    return this.imageIndexes[productId] || 0;
  }

  prevImage(productId: number, total: number, event: Event) {
    event.stopPropagation();
    const current = this.getImageIndex(productId);
    this.imageIndexes[productId] = current === 0 ? total - 1 : current - 1;
    this.cdr.detectChanges();
  }

  nextImage(productId: number, total: number, event: Event) {
    event.stopPropagation();
    const current = this.getImageIndex(productId);
    this.imageIndexes[productId] = current === total - 1 ? 0 : current + 1;
    this.cdr.detectChanges();
  }

  openProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  addToCart(item: any, event?: Event) {
    event?.stopPropagation();

    if (item.is_available === false) return;

    this.cartService.addItem(item);
    this.successMessage = item.name + ' добавлен в корзину';
    this.cdr.detectChanges();
  }

  increaseQty(productId: number, event?: Event) {
    event?.stopPropagation();
    this.cartService.increaseItem(productId);
    this.cdr.detectChanges();
  }

  decreaseQty(productId: number, event?: Event) {
    event?.stopPropagation();
    this.cartService.decreaseItem(productId);
    this.cdr.detectChanges();
  }

  getCartCount() {
    return this.cartService.getTotalCount();
  }

  getItemCount(productId: number) {
    return this.cartService.getItemCount(productId);
  }

  toggleReviews(productId: number, event?: Event) {
    event?.stopPropagation();
    this.openReviews[productId] = !this.openReviews[productId];
    if (!this.reviewDrafts[productId]) {
      this.reviewDrafts[productId] = { rating: 0, comment: '' };
    }
    this.cdr.detectChanges();
  }

  isReviewsOpen(productId: number) {
    return !!this.openReviews[productId];
  }

  setRating(productId: number, rating: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.reviewDrafts[productId]) {
      this.reviewDrafts[productId] = { rating: 0, comment: '' };
    }
    this.reviewDrafts[productId].rating = rating;
    this.cdr.detectChanges();
  }

  getSelectedRating(productId: number) {
    return this.reviewDrafts[productId]?.rating || 0;
  }

  getReviewComment(productId: number) {
    return this.reviewDrafts[productId]?.comment || '';
  }

  setReviewComment(productId: number, value: string) {
    if (!this.reviewDrafts[productId]) {
      this.reviewDrafts[productId] = { rating: 0, comment: '' };
    }
    this.reviewDrafts[productId].comment = value;
  }

  async submitReview(productId: number) {
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
      const response = await fetch('http://127.0.0.1:8000/api/products/' + productId + '/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          rating: draft.rating,
          comment: draft.comment
        })
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.clear();
        this.router.navigate(['/login']);
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось сохранить отзыв');
      }

      this.successMessage = 'Отзыв сохранён.';
      this.errorMessage = '';
      await this.loadAll();
    } catch (error) {
      this.successMessage = '';
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось сохранить отзыв.';
      this.cdr.detectChanges();
    }
  }

  openFavorites() {
    this.router.navigate(['/favorites']);
  }

  openCart() {
    this.router.navigate(['/cart']);
  }

  openOrders() {
    this.router.navigate(['/orders']);
  }

  goBack() {
    this.router.navigate(['/branches']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}