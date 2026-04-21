import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="hero">
        <div class="hero__text">
          <span class="badge">Избранное</span>
          <h1>Твои любимые товары</h1>
          <p>
            Здесь собраны позиции, которые ты сохранил. Можно быстро добавить их в корзину
            или убрать из избранного.
          </p>
        </div>

        <div class="hero__actions">
          <button class="ghost-btn" (click)="goBack()">Назад</button>
          <button class="ghost-btn" (click)="openOrders()">Мои заказы</button>
          <button class="primary-top-btn" (click)="openCart()">Корзина ({{ getCartCount() }})</button>
          <button class="dark-btn" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state" *ngIf="loading">Загружаю избранное...</div>
      <div class="state error" *ngIf="!loading && errorMessage">{{ errorMessage }}</div>

      <div class="empty-card" *ngIf="!loading && !errorMessage && favorites.length === 0">
        <div class="empty-card__icon">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 20s-6.5-4.2-8.6-8C1.7 9.2 3 5.8 6.4 5.1A4.7 4.7 0 0 1 12 7.2a4.7 4.7 0 0 1 5.6-2.1c3.4.7 4.7 4.1 3 6.9C18.5 15.8 12 20 12 20Z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <h2>Пока в избранном ничего нет</h2>
        <p>Сохраняй товары из меню, чтобы быстро возвращаться к ним позже.</p>

        <div class="empty-card__chips">
          <span>Популярное</span>
          <span>Бургеры</span>
          <span>Напитки</span>
        </div>

        <button class="empty-card__link" (click)="goBack()">Перейти в меню</button>
      </div>

      <div class="grid" *ngIf="!loading && !errorMessage && favorites.length > 0">
        <article class="card clickable-card" *ngFor="let item of favorites" (click)="openProduct(item.id)">
          <div class="card__media">
            <img
              class="image"
              [src]="getImageUrl(item)"
              [alt]="item.name"
            />

            <button class="favorite-btn active" (click)="removeFavorite(item.id, $event)" aria-label="Убрать из избранного">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 20s-6.5-4.2-8.6-8C1.7 9.2 3 5.8 6.4 5.1A4.7 4.7 0 0 1 12 7.2a4.7 4.7 0 0 1 5.6-2.1c3.4.7 4.7 4.1 3 6.9C18.5 15.8 12 20 12 20Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  fill="currentColor"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <div class="meta-row">
            <div class="rating">{{ formatRating(item.avg_rating) }} ⭐</div>
            <div class="stock-chip" [class.out]="item.is_available === false">
              {{ item.is_available === false ? 'Нет в наличии' : 'В наличии' }}
            </div>
          </div>

          <h3>{{ item.name }}</h3>
          <div class="reviews-count">{{ item.reviews_count || 0 }} отзывов</div>
          <p class="desc">{{ item.description }}</p>
          <div class="price">{{ item.price }} ₸</div>

          <div class="actions" (click)="$event.stopPropagation()">
            <ng-container *ngIf="item.is_available !== false; else unavailableTpl">
              <button
                class="cart-btn"
                *ngIf="getItemCount(item.id) === 0"
                (click)="addToCart(item)"
              >
                В корзину
              </button>

              <div class="qty-box" *ngIf="getItemCount(item.id) > 0">
                <button class="qty-btn" (click)="decreaseQty(item.id)">−</button>
                <span class="qty-value">{{ getItemCount(item.id) }}</span>
                <button class="qty-btn" (click)="increaseQty(item.id)">+</button>
              </div>
            </ng-container>

            <ng-template #unavailableTpl>
              <div class="unavailable">Нет в наличии</div>
            </ng-template>

            <button class="danger" (click)="removeFavorite(item.id, $event)">Убрать</button>
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
    .danger,
    .empty-card__link {
      border: none;
      border-radius: 16px;
      padding: 13px 16px;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
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
    .empty-card__link {
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
    .empty-card__link:hover,
    .danger:hover {
      transform: translateY(-1px);
    }

    .danger {
      background: #fff1f0;
      color: #b42318;
      border: 1px solid #ffd8d3;
    }

    .state,
    .empty-card,
    .card {
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

    .empty-card {
      padding: 44px 24px;
      text-align: center;
    }

    .empty-card__icon {
      width: 84px;
      height: 84px;
      margin: 0 auto 18px;
      border-radius: 24px;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #edf4ff, #ffffff);
      border: 1px solid #dbe7fb;
      box-shadow:
        0 18px 30px rgba(47, 108, 255, 0.10),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      color: #ff5b7f;
    }

    .empty-card__icon svg {
      width: 34px;
      height: 34px;
      display: block;
    }

    .empty-card h2 {
      margin: 0 0 10px;
      font-size: 24px;
      color: #18263b;
      font-weight: 900;
    }

    .empty-card p {
      margin: 0 0 18px;
      color: #72839b;
      font-size: 16px;
      line-height: 1.6;
    }

    .empty-card__chips {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 22px;
    }

    .empty-card__chips span {
      display: inline-flex;
      align-items: center;
      padding: 9px 13px;
      border-radius: 999px;
      background: #f7faff;
      border: 1px solid #dfe9fb;
      color: #5c6c86;
      font-size: 13px;
      font-weight: 800;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .card {
      padding: 18px;
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

    .card__media {
      position: relative;
      margin-bottom: 14px;
    }

    .image {
      width: 100%;
      height: 230px;
      object-fit: cover;
      object-position: center;
      border-radius: 18px;
      display: block;
      background: linear-gradient(135deg, #edf4ff, #f8fbff);
      border: 1px solid #e2ebf8;
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
    }

    .favorite-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 42px;
      height: 42px;
      border-radius: 999px;
      border: none;
      background: rgba(255, 255, 255, 0.94);
      color: #ff5b7f;
      box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
      display: grid;
      place-items: center;
      cursor: pointer;
    }

    .favorite-btn svg {
      width: 20px;
      height: 20px;
      display: block;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 10px;
      align-items: center;
    }

    .rating {
      font-weight: 900;
      color: #111827;
    }

    .stock-chip {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 7px 11px;
      font-size: 12px;
      font-weight: 800;
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

    .reviews-count {
      color: #73839a;
      font-size: 14px;
      margin-bottom: 10px;
    }

    .desc {
      min-height: 48px;
      margin-bottom: 16px;
      color: #6b7c94;
    }

    .price {
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 16px;
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
    }
  `]
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('role') !== 'buyer') {
      this.router.navigate(['/orders']);
      return;
    }

    this.loadFavorites();
  }

  async loadFavorites() {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/favorites/', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить избранное');
      }

      const data = await response.json();
      this.favorites = Array.isArray(data) ? data : [];
      this.loading = false;
      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (error) {
      this.loading = false;
      this.errorMessage =
        error instanceof Error ? error.message : 'Не удалось загрузить избранное.';
      this.cdr.detectChanges();
    }
  }

  getImageUrl(item: any): string {
    if (item.images?.[0]?.image_url) {
      return item.images[0].image_url;
    }

    const name = String(item.name || '').toLowerCase();

    if (name.includes('chicken')) {
      return 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80';
    }

    if (name.includes('beef')) {
      return 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80';
    }

    if (name.includes('burger')) {
      return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80';
    }

    if (name.includes('sandwich')) {
      return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80';
    }

    if (name.includes('coffee')) {
      return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80';
    }

    if (name.includes('cola') || name.includes('drink')) {
      return 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=900&q=80';
    }

    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80';
  }

  async removeFavorite(productId: number, event?: Event) {
    event?.stopPropagation();

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/favorites/' + productId + '/', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (!response.ok) {
        throw new Error('Не удалось убрать из избранного');
      }

      this.favorites = this.favorites.filter(item => item.id !== productId);
      this.cdr.detectChanges();
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Не удалось убрать из избранного.';
      this.cdr.detectChanges();
    }
  }

  addToCart(item: any) {
    if (item.is_available === false) return;
    this.cartService.addItem(item);
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

  getItemCount(productId: number) {
    return this.cartService.getItemCount(productId);
  }

  getCartCount() {
    return this.cartService.getTotalCount();
  }

  openCart() {
    this.router.navigate(['/cart']);
  }

  openProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  formatRating(value: number): string {
    return Number(value || 0).toFixed(1);
  }

  goBack() {
    this.router.navigate(['/branches']);
  }

  openOrders() {
    this.router.navigate(['/orders']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
} 