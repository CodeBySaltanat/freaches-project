import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';

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
          <button (click)="goBack()">Назад в меню</button>
         <button (click)="openOrders()">Мои заказы</button>
          <button class="ghost" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state" *ngIf="cart.length === 0">
        Корзина пока пустая.
      </div>

      <div *ngIf="cart.length > 0">
        <div class="item" *ngFor="let item of cart; let i = index">
          <div>
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
          </div>

          <div class="item-right">
            <div class="price">{{ item.price }} ₸</div>
            <button class="remove" (click)="removeItem(i)">Удалить</button>
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

          <div class="total">Итого: {{ getTotalPrice() }} ₸</div>

          <div class="message error" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button class="submit" (click)="placeOrder()" [disabled]="loading">
            {{ loading ? 'Подожди...' : 'Оформить заказ' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; padding: 32px; background: #f7f1ea; font-family: Arial, sans-serif; box-sizing: border-box; }
    .topbar { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 28px; }
    h1 { margin: 0 0 8px; font-size: 36px; }
    p { margin: 0; color: #666; }
    .topbar-actions { display: flex; gap: 10px; }
    .topbar-actions button { border: none; border-radius: 12px; padding: 12px 16px; background: #ff8a3d; color: white; font-weight: 700; cursor: pointer; }
    .topbar-actions .ghost { background: #333; }
    .state, .item, .checkout { background: white; border-radius: 18px; padding: 18px; box-shadow: 0 12px 30px rgba(0,0,0,0.06); margin-bottom: 16px; }
    .item { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; }
    .item h3 { margin: 0 0 8px; }
    .item-right { text-align: right; }
    .price { font-size: 20px; font-weight: 800; margin-bottom: 10px; }
    .remove, .submit { border: none; border-radius: 12px; padding: 12px 16px; cursor: pointer; font-weight: 700; }
    .remove { background: #fff1f0; color: #b42318; }
    .field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    .field label { font-weight: 700; }
    .field input { padding: 12px 14px; border: 1px solid #d8d8d8; border-radius: 12px; font-size: 15px; }
    .total { font-size: 24px; font-weight: 800; margin: 20px 0; }
    .submit { width: 100%; background: #ff8a3d; color: white; }
    .submit:disabled { opacity: 0.7; cursor: wait; }
    .message.error { background: #fff1f0; color: #c23b2f; padding: 12px; border-radius: 12px; margin-bottom: 14px; font-weight: 600; }
  `]
})
export class CartComponent implements OnInit {
  cart: any[] = [];
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

    this.cart = this.cartService.getItems();
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

    const grouped: Record<number, { product: number; quantity: number }> = {};

    for (const item of this.cart) {
      if (grouped[item.id]) {
        grouped[item.id].quantity += 1;
      } else {
        grouped[item.id] = { product: item.id, quantity: 1 };
      }
    }

    const orderData = {
      address: this.address,
      comment: this.comment,
      items: Object.values(grouped)
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
      console.error('order create error', error);
      this.loading = false;
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось отправить заказ.';
      this.cdr.detectChanges();
    }
  }

  removeItem(index: number) {
    this.cartService.removeItem(index);
    this.cart = this.cartService.getItems();
    this.cdr.detectChanges();
  }

  getTotalPrice() {
    return this.cart.reduce((sum, item) => sum + Number(item.price), 0);
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