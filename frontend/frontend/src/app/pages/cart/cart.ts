import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="topbar">
        <div>
          <h1>Корзина</h1>
          <p>Проверь заказ перед отправкой</p>
        </div>

        <div class="topbar-actions">
          <button (click)="goBack()">Назад</button>
          <button (click)="openOrders()">Мои заказы</button>
          <button class="ghost" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state" *ngIf="cart.length === 0">
        Корзина пока пустая.
      </div>

      <div *ngIf="cart.length > 0">
        <div class="item" *ngFor="let item of cart">
          <img
            class="thumb"
            [src]="item.images?.[0]?.image_url || 'https://picsum.photos/seed/noimage/300/200'"
            [alt]="item.name"
          />

          <div class="item-main">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>

            <div class="item-controls">
              <div class="qty-box">
                <button class="qty-btn" (click)="decreaseQty(item.id)">−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" (click)="increaseQty(item.id)">+</button>
              </div>

              <button class="remove" (click)="removeItem(item.id)">Удалить</button>
            </div>
          </div>

          <div class="item-right">
            <div class="price">{{ item.price }} ₸</div>
            <div class="subtotal">{{ getItemSubtotal(item) }} ₸</div>
          </div>
        </div>

        <div class="checkout">
          <div class="field">
            <label>Адрес доставки</label>
            <input [(ngModel)]="address" placeholder="Введите адрес" />
          </div>

          <div class="field">
            <label>Комментарий</label>
            <input [(ngModel)]="comment" placeholder="Например: позвонить за 5 минут" />
          </div>

          <div class="summary">
            <div>Товаров: {{ getTotalCount() }}</div>
            <div class="total">Итого: {{ getTotalPrice() }} ₸</div>
          </div>

          <div class="message error" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button class="submit" (click)="placeOrder()" [disabled]="loading">
            {{ loading ? 'Подожди...' : 'Оформить заказ' }}
          </button>
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

    .topbar-actions button {
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

    .state, .item, .checkout {
      background: white;
      border-radius: 18px;
      padding: 18px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
      margin-bottom: 16px;
    }

    .item {
      display: grid;
      grid-template-columns: 120px 1fr auto;
      gap: 18px;
      align-items: center;
    }

    .thumb {
      width: 120px;
      height: 100px;
      object-fit: cover;
      border-radius: 14px;
      display: block;
      background: #f2f2f2;
    }

    .item-main h3 {
      margin: 0 0 8px;
    }

    .item-controls {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 12px;
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

    .remove, .submit {
      border: none;
      border-radius: 12px;
      padding: 12px 16px;
      cursor: pointer;
      font-weight: 700;
    }

    .remove {
      background: #fff1f0;
      color: #b42318;
    }

    .item-right {
      text-align: right;
    }

    .price {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .subtotal {
      color: #666;
      font-weight: 700;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 14px;
    }

    .field label {
      font-weight: 700;
    }

    .field input {
      padding: 12px 14px;
      border: 1px solid #d8d8d8;
      border-radius: 12px;
      font-size: 15px;
    }

    .summary {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: center;
      margin: 20px 0;
      font-weight: 700;
      flex-wrap: wrap;
    }

    .total {
      font-size: 24px;
      font-weight: 800;
    }

    .submit {
      width: 100%;
      background: #ff8a3d;
      color: white;
    }

    .submit:disabled {
      opacity: 0.7;
      cursor: wait;
    }

    .message.error {
      background: #fff1f0;
      color: #c23b2f;
      padding: 12px;
      border-radius: 12px;
      margin-bottom: 14px;
      font-weight: 600;
    }
  `]
})
export class CartComponent implements OnInit {
  cart: CartItem[] = [];
  address = '';
  comment = '';
  loading = false;
  errorMessage = '';

  constructor(
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (localStorage.getItem('role') !== 'buyer') {
      this.router.navigate(['/orders']);
      return;
    }

    this.refreshCart();
  }

  refreshCart() {
    this.cart = this.cartService.getItems();
    this.cdr.detectChanges();
  }

  increaseQty(productId: number) {
    this.cartService.increaseItem(productId);
    this.refreshCart();
  }

  decreaseQty(productId: number) {
    this.cartService.decreaseItem(productId);
    this.refreshCart();
  }

  removeItem(productId: number) {
    this.cartService.removeItem(productId);
    this.refreshCart();
  }

  getItemSubtotal(item: CartItem) {
    return Number(item.price || 0) * Number(item.quantity || 0);
  }

  getTotalCount() {
    return this.cartService.getTotalCount();
  }

  getTotalPrice() {
    return this.cartService.getTotalPrice();
  }

  async placeOrder() {
    this.errorMessage = '';

    if (!this.address.trim()) {
      this.errorMessage = 'Введите адрес доставки.';
      return;
    }

    if (this.cart.length === 0) {
      this.errorMessage = 'Корзина пуста.';
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      this.errorMessage = 'Сессия истекла. Войди заново.';
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    const orderData = {
      address: this.address,
      comment: this.comment,
      items: this.cart.map(item => ({
        product: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token.trim()
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.clear();
        this.loading = false;
        this.errorMessage = 'Сессия истекла. Войди заново.';
        this.cdr.detectChanges();
        this.router.navigate(['/login']);
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || ('HTTP ' + response.status));
      }

      this.cartService.clearCart();
      this.cart = [];
      this.loading = false;
      this.cdr.detectChanges();
      this.router.navigate(['/orders']);
    } catch (error) {
      this.loading = false;
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось отправить заказ.';
      this.cdr.detectChanges();
    }
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