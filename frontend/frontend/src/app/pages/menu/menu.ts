import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="topbar">
        <div>
          <h1>Меню филиала</h1>
          <p>Выбирай товары и добавляй их в корзину</p>
        </div>

        <div class="topbar-actions">
          <button (click)="goBack()">Филиалы</button>
          <button (click)="openCart()">Корзина ({{ getCartCount() }})</button>
          <button (click)="openOrders()">Мои заказы</button>
          <button class="ghost" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state" *ngIf="loading">Загружаю меню...</div>

      <div class="state error" *ngIf="!loading && errorMessage">
        {{ errorMessage }}
      </div>

      <div class="state" *ngIf="!loading && !errorMessage && products.length === 0">
        Для этого филиала пока нет товаров.
      </div>

      <div class="grid" *ngIf="!loading && !errorMessage && products.length > 0">
        <div class="card" *ngFor="let item of products">
          <div class="carousel">
            <ng-container *ngIf="item.images?.length > 0; else noImage">
              <img
                class="product-image"
                [src]="item.images[getImageIndex(item.id)].image_url"
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

              <div class="dots" *ngIf="item.images.length > 1">
                <span
                  *ngFor="let image of item.images; let i = index"
                  [class.active]="getImageIndex(item.id) === i">
                </span>
              </div>
            </ng-container>

            <ng-template #noImage>
              <div class="no-image">Нет фото</div>
            </ng-template>
          </div>

          <h3>{{ item.name }}</h3>
          <p class="desc">{{ item.description }}</p>
          <div class="price">{{ item.price }} ₸</div>

          <div class="bottom-row">
            <button (click)="addToCart(item)">В корзину</button>
            <span class="count" *ngIf="getItemCount(item.id) > 0">
              В корзине: {{ getItemCount(item.id) }}
            </span>
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
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 28px;
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
    .card button {
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
      padding: 22px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
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

    .dots {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin-top: 10px;
    }

    .dots span {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #d2d2d2;
      display: inline-block;
    }

    .dots span.active {
      background: #ff8a3d;
    }

    .card h3 {
      margin: 0 0 10px;
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
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }

    .count {
      font-size: 14px;
      font-weight: 700;
      color: #ff8a3d;
    }
  `]
})
export class MenuComponent implements OnInit {
  products: any[] = [];
  branchId = 0;
  loading = true;
  errorMessage = '';
  imageIndexes: Record<number, number> = {};

  constructor(
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('role') !== 'buyer') {
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

    this.loadProducts();
  }

  async loadProducts() {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/products/?branch=' + this.branchId);
      if (!response.ok) {
        throw new Error('Не удалось загрузить меню');
      }

      const data = await response.json();
      this.products = Array.isArray(data) ? data : [];
      this.loading = false;
      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить меню филиала.';
      this.loading = false;
      this.cdr.detectChanges();
    }
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

  addToCart(item: any) {
    this.cartService.addItem(item);
    this.cdr.detectChanges();
  }

  getCartCount() {
    return this.cartService.getItems().length;
  }

  getItemCount(productId: number) {
    return this.cartService.getItems().filter((item: any) => item.id === productId).length;
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