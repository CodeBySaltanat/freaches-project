import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="topbar">
        <div>
          <h1>Заказы</h1>
          <p>{{ role === 'producer' ? 'Управление входящими заказами' : 'Твои оформленные заказы' }}</p>
        </div>

        <div class="topbar-actions">
          <button (click)="goHome()">Домой</button>
          <button class="ghost" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state" *ngIf="loading">Загружаю заказы...</div>

      <div class="state error" *ngIf="!loading && errorMessage">
        {{ errorMessage }}
      </div>

      <div class="state" *ngIf="!loading && !errorMessage && orders.length === 0">
        Заказов пока нет.
      </div>

      <div class="orders" *ngIf="!loading && !errorMessage && orders.length > 0">
        <div class="order-card" *ngFor="let order of orders">
          <div class="order-top">
            <div>
              <h3>Заказ #{{ order.id }}</h3>
              <p class="muted">{{ order.created_at }}</p>
              <p class="muted" *ngIf="role === 'producer'">Покупатель: {{ order.user_name }}</p>
              <p class="muted" *ngIf="order.address">Адрес: {{ order.address }}</p>
              <p class="muted" *ngIf="order.comment">Комментарий: {{ order.comment }}</p>
            </div>

            <span class="status">{{ getStatusLabel(order.status) }}</span>
          </div>

          <div class="items" *ngIf="order.items?.length">
            <div class="item-row" *ngFor="let item of order.items">
              <span>{{ item.product_name }}</span>
              <span>x{{ item.quantity }}</span>
            </div>
          </div>

          <div class="total" *ngIf="order.total !== undefined">
            Итого: {{ order.total }} ₸
          </div>

          <div class="producer-actions" *ngIf="role === 'producer'">
            <button
              *ngIf="order.status === 'pending'"
              (click)="updateStatus(order.id, 'accepted')">
              Принять
            </button>

            <button
              *ngIf="order.status === 'pending' || order.status === 'accepted'"
              class="danger"
              (click)="updateStatus(order.id, 'out_of_stock')">
              Нет в наличии
            </button>

            <button
              *ngIf="order.status === 'accepted'"
              (click)="updateStatus(order.id, 'ready')">
              Готово
            </button>

            <button
              *ngIf="order.status === 'ready'"
              (click)="updateStatus(order.id, 'completed')">
              Получено
            </button>
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

    .orders {
      display: grid;
      gap: 18px;
    }

    .order-card {
      background: white;
      border-radius: 18px;
      padding: 20px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
    }

    .order-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }

    .order-top h3 {
      margin: 0 0 8px;
    }

    .muted {
      color: #777;
      font-size: 14px;
      margin-top: 4px;
    }

    .status {
      background: #fff2e9;
      color: #ff8a3d;
      padding: 8px 12px;
      border-radius: 999px;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 12px;
      white-space: nowrap;
    }

    .items {
      display: grid;
      gap: 8px;
      margin-bottom: 16px;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 12px;
      background: #f8f8f8;
      border-radius: 12px;
    }

    .total {
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 16px;
    }

    .producer-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .producer-actions button {
      border: none;
      border-radius: 12px;
      padding: 10px 14px;
      background: #ff8a3d;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .producer-actions .danger {
      background: #c23b2f;
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  errorMessage = '';
  role = localStorage.getItem('role') || 'buyer';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  async loadOrders() {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/orders/', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить заказы');
      }

      const data = await response.json();
      this.orders = Array.isArray(data) ? data : [];
      this.loading = false;
      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (error) {
      console.error('orders load error', error);
      this.loading = false;
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить заказы.';
      this.cdr.detectChanges();
    }
  }

  async updateStatus(orderId: number, status: string) {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/orders/' + orderId + '/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ status: status })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось обновить статус');
      }

      await this.loadOrders();
    } catch (error) {
      console.error('status update error', error);
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось обновить статус.';
      this.cdr.detectChanges();
    }
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

  goHome() {
    this.router.navigate([this.role === 'producer' ? '/producer/branches' : '/branches']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}