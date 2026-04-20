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
      <div class="topbar">
        <div>
          <h1>Избранное</h1>
          <p>Твои любимые товары</p>
        </div>

        <div class="topbar-actions">
          <button (click)="openCart()">Корзина ({{ getCartCount() }})</button>
          <button (click)="goBack()">Назад</button>
          <button (click)="openOrders()">Мои заказы</button>
          <button class="ghost" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state" *ngIf="loading">Загружаю избранное...</div>
      <div class="state error" *ngIf="!loading && errorMessage">{{ errorMessage }}</div>

      <div class="state" *ngIf="!loading && !errorMessage && favorites.length === 0">
        Пока в избранном ничего нет.
      </div>

      <div class="grid" *ngIf="!loading && !errorMessage && favorites.length > 0">
        <div class="card" *ngFor="let item of favorites">
          <img
            class="image"
            [src]="item.images?.[0]?.image_url || 'https://picsum.photos/seed/noimage/600/400'"
            [alt]="item.name"
          />

          <h3>{{ item.name }}</h3>
          <div class="rating">{{ formatRating(item.avg_rating) }} ⭐ · {{ item.reviews_count || 0 }} отзывов</div>
          <p>{{ item.description }}</p>
          <div class="price">{{ item.price }} ₸</div>

          <div class="actions">
            <ng-container *ngIf="item.is_available !== false; else unavailableTpl">
              <button *ngIf="getItemCount(item.id) === 0" (click)="addToCart(item)">В корзину</button>

              <div class="qty-box" *ngIf="getItemCount(item.id) > 0">
                <button class="qty-btn" (click)="decreaseQty(item.id)">−</button>
                <span class="qty-value">{{ getItemCount(item.id) }}</span>
                <button class="qty-btn" (click)="increaseQty(item.id)">+</button>
              </div>
            </ng-container>

            <ng-template #unavailableTpl>
              <div class="unavailable">Нет в наличии</div>
            </ng-template>

            <button class="danger" (click)="removeFavorite(item.id)">Убрать ❤️</button>
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
    .actions > button {
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

    .danger {
      background: #c23b2f !important;
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

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 18px;
    }

    .card {
      background: white;
      border-radius: 18px;
      padding: 20px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
    }

    .image {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-radius: 14px;
      margin-bottom: 14px;
      display: block;
      background: #f2f2f2;
    }

    .card h3 {
      margin: 0 0 8px;
    }

    .rating {
      font-weight: 700;
      color: #444;
      margin-bottom: 10px;
    }

    .price {
      font-size: 22px;
      font-weight: 800;
      margin: 16px 0;
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
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить избранное.';
      this.cdr.detectChanges();
    }
  }

  async removeFavorite(productId: number) {
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
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось убрать из избранного.';
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