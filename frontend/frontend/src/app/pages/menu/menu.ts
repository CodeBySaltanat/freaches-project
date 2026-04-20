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
    .page { min-height: 100vh; padding: 32px; background: #f7f1ea; font-family: Arial, sans-serif; box-sizing: border-box; }
    .topbar { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 28px; }
    h1 { margin: 0 0 8px; font-size: 36px; }
    p { margin: 0; color: #666; }
    .topbar-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .topbar-actions button, .card button { border: none; border-radius: 12px; padding: 12px 16px; background: #ff8a3d; color: white; font-weight: 700; cursor: pointer; }
    .topbar-actions .ghost { background: #333; }
    .state { background: white; border-radius: 16px; padding: 18px; margin-bottom: 20px; }
    .state.error { color: #b42318; background: #fff1f0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; }
    .card { background: white; border-radius: 18px; padding: 22px; box-shadow: 0 12px 30px rgba(0,0,0,0.06); }
    .card h3 { margin: 0 0 10px; }
    .desc { min-height: 48px; margin-bottom: 18px; }
    .price { font-size: 22px; font-weight: 800; margin-bottom: 16px; color: #111; }
    .bottom-row { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
    .count { font-size: 14px; font-weight: 700; color: #ff8a3d; }
  `]
})
export class MenuComponent implements OnInit {
  products: any[] = [];
  branchId = 0;
  loading = true;
  errorMessage = '';

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
      if (!response.ok) throw new Error('HTTP error');

      const data = await response.json();
      this.products = Array.isArray(data) ? data : [];
      this.loading = false;
      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (error) {
      console.error('menu fetch error:', error);
      this.errorMessage = 'Не удалось загрузить меню филиала.';
      this.loading = false;
      this.cdr.detectChanges();
    }
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