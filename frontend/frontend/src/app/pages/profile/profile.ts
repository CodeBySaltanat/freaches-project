import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="topbar">
        <div>
          <h1>Профиль</h1>
          <p>Личные данные и история заказов</p>
        </div>

        <div class="topbar-actions">
          <button *ngIf="role === 'buyer'" (click)="openCart()">Корзина ({{ getCartCount() }})</button>
          <button (click)="goBack()">Назад</button>
          <button class="ghost" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state" *ngIf="loading">Загружаю профиль...</div>
      <div class="state error" *ngIf="!loading && errorMessage">{{ errorMessage }}</div>
      <div class="state success" *ngIf="successMessage">{{ successMessage }}</div>

      <div *ngIf="!loading && profile" class="layout">
        <div class="card">
          <h2>Основная информация</h2>

          <div class="field">
            <label>Логин</label>
            <input [value]="profile.username" disabled />
          </div>

          <div class="field">
            <label>Роль</label>
            <input [value]="profile.role_label" disabled />
          </div>

          <div class="field">
            <label>Имя</label>
            <input [(ngModel)]="fullName" placeholder="Например, Saltanat" />
          </div>

          <div class="field">
            <label>Телефон</label>
            <input [(ngModel)]="phone" placeholder="+7 777 123 45 67" />
          </div>

          <h3>Сохранённые адреса</h3>

          <div class="address-add">
            <input [(ngModel)]="newAddress" placeholder="Добавить новый адрес" />
            <button (click)="addAddress()">Добавить</button>
          </div>

          <div class="addresses" *ngIf="savedAddresses.length > 0">
            <div class="address-item" *ngFor="let address of savedAddresses; let i = index">
              <span>{{ address }}</span>
              <button class="danger" (click)="removeAddress(i)">Удалить</button>
            </div>
          </div>

          <button class="save-btn" (click)="saveProfile()">Сохранить профиль</button>
        </div>

        <div class="card">
          <h2>Прошлые заказы</h2>

          <div class="empty" *ngIf="recentOrders.length === 0">
            Пока заказов нет.
          </div>

          <div class="order-item" *ngFor="let order of recentOrders">
            <div class="order-top">
              <strong>Заказ #{{ order.buyer_order_number || order.id }}</strong>
              <span>{{ getStatusLabel(order.status) }}</span>
            </div>
            <div class="order-date">{{ formatDate(order.created_at) }}</div>
            <div class="order-total">Итого: {{ order.total }} ₸</div>
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

    h2 {
      margin: 0 0 18px;
      font-size: 28px;
    }

    h3 {
      margin: 20px 0 12px;
      font-size: 20px;
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
    .save-btn,
    .address-add button {
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
      border: none;
      border-radius: 10px;
      padding: 8px 12px;
      color: white;
      font-weight: 700;
      cursor: pointer;
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

    .layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .card {
      background: white;
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
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

    .address-add {
      display: flex;
      gap: 10px;
      margin-bottom: 14px;
    }

    .address-add input {
      flex: 1;
      padding: 12px 14px;
      border: 1px solid #d8d8d8;
      border-radius: 12px;
      font-size: 15px;
    }

    .addresses {
      display: grid;
      gap: 10px;
      margin-bottom: 18px;
    }

    .address-item {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      background: #f8f8f8;
      border-radius: 12px;
      padding: 12px;
    }

    .save-btn {
      width: 100%;
    }

    .empty {
      color: #777;
    }

    .order-item {
      background: #f8f8f8;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 10px;
    }

    .order-top {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 6px;
    }

    .order-date {
      color: #777;
      font-size: 14px;
      margin-bottom: 6px;
    }

    .order-total {
      font-weight: 700;
    }

    @media (max-width: 900px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  loading = true;
  errorMessage = '';
  successMessage = '';

  profile: any = null;
  recentOrders: any[] = [];

  fullName = '';
  phone = '';
  newAddress = '';
  savedAddresses: string[] = [];

  role = localStorage.getItem('role') || 'buyer';

  constructor(
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  async loadProfile() {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/profile/', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить профиль');
      }

      const data = await response.json();
      this.profile = data;
      this.recentOrders = Array.isArray(data.recent_orders) ? data.recent_orders : [];
      this.fullName = data.full_name || '';
      this.phone = data.phone || '';
      this.savedAddresses = Array.isArray(data.saved_addresses) ? data.saved_addresses : [];

      this.loading = false;
      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (error) {
      this.loading = false;
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить профиль.';
      this.cdr.detectChanges();
    }
  }

  addAddress() {
    const value = this.newAddress.trim();
    if (!value) return;
    this.savedAddresses.push(value);
    this.newAddress = '';
  }

  removeAddress(index: number) {
    this.savedAddresses.splice(index, 1);
  }

  async saveProfile() {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          full_name: this.fullName,
          phone: this.phone,
          saved_addresses: this.savedAddresses
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось сохранить профиль');
      }

      this.successMessage = 'Профиль сохранён';
      this.errorMessage = '';
      await this.loadProfile();
    } catch (error) {
      this.successMessage = '';
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось сохранить профиль.';
      this.cdr.detectChanges();
    }
  }

  getCartCount() {
    return this.cartService.getTotalCount();
  }

  openCart() {
    this.router.navigate(['/cart']);
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Новый',
      accepted: 'Принят',
      out_of_stock: 'Нет в наличии',
      ready: 'Готов',
      completed: 'Получен'
    };
    return map[status] || status;
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString();
  }

  goBack() {
    this.router.navigate([this.role === 'producer' ? '/producer/branches' : '/branches']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}