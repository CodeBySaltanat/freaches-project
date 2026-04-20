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

      <div class="stats-grid" *ngIf="role === 'producer' && stats">
        <div class="stat-card"><span>Всего заказов</span><strong>{{ stats.total_orders }}</strong></div>
        <div class="stat-card"><span>Новые</span><strong>{{ stats.new_orders }}</strong></div>
        <div class="stat-card"><span>Готовые</span><strong>{{ stats.ready_orders }}</strong></div>
        <div class="stat-card"><span>Нет в наличии</span><strong>{{ stats.out_of_stock_orders }}</strong></div>
      </div>

      <div class="extra-stats" *ngIf="role === 'producer' && stats">
        <div class="extra-card">
          <h3>Популярные товары</h3>
          <div class="mini-row" *ngFor="let item of stats.popular_products">
            <span>{{ item.name }}</span>
            <strong>{{ item.total_qty }}</strong>
          </div>
        </div>

        <div class="extra-card">
          <h3>Заказы по филиалам</h3>
          <div class="mini-row" *ngFor="let item of stats.orders_by_branch">
            <span>{{ item.branch_name }}</span>
            <strong>{{ item.order_count }}</strong>
          </div>
        </div>
      </div>

      <div class="filters" *ngIf="role === 'producer'">
        <button [class.active]="statusFilter === 'all'" (click)="setFilter('all')">Все</button>
        <button [class.active]="statusFilter === 'pending'" (click)="setFilter('pending')">Новые</button>
        <button [class.active]="statusFilter === 'accepted'" (click)="setFilter('accepted')">Приняты</button>
        <button [class.active]="statusFilter === 'ready'" (click)="setFilter('ready')">Готовые</button>
        <button [class.active]="statusFilter === 'out_of_stock'" (click)="setFilter('out_of_stock')">Нет в наличии</button>
        <button [class.active]="statusFilter === 'completed'" (click)="setFilter('completed')">Полученные</button>
      </div>

      <div class="state" *ngIf="loading">Загружаю заказы...</div>
      <div class="state error" *ngIf="!loading && errorMessage">{{ errorMessage }}</div>

      <div class="state" *ngIf="!loading && !errorMessage && filteredOrders.length === 0">
        Заказов пока нет.
      </div>

      <div class="orders" *ngIf="!loading && !errorMessage && filteredOrders.length > 0">
        <div class="order-card" *ngFor="let order of filteredOrders">
          <div class="order-top">
            <div class="order-info">
              <h3 *ngIf="role === 'buyer'">Заказ #{{ order.buyer_order_number || order.id }}</h3>
              <h3 *ngIf="role === 'producer'">
                Заказ #{{ order.id }} · у покупателя #{{ order.buyer_order_number || order.id }}
              </h3>

              <p class="muted">{{ formatDate(order.created_at) }}</p>
              <p class="muted" *ngIf="role === 'producer'">Покупатель: {{ order.user_name }}</p>
              <p class="muted" *ngIf="order.address">Адрес: {{ order.address }}</p>
              <p class="muted" *ngIf="order.comment">Комментарий: {{ order.comment }}</p>
            </div>

            <div class="badge-wrap">
              <span class="status-badge" [ngClass]="getBadgeClass(order.status)">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
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
            <button *ngIf="order.status === 'pending'" (click)="updateStatus(order.id, 'accepted')">Принять</button>
            <button *ngIf="order.status === 'pending' || order.status === 'accepted'" class="danger" (click)="updateStatus(order.id, 'out_of_stock')">Нет в наличии</button>
            <button *ngIf="order.status === 'accepted'" (click)="updateStatus(order.id, 'ready')">Готово</button>
            <button *ngIf="order.status === 'ready'" (click)="updateStatus(order.id, 'completed')">Получено</button>
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
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .topbar-actions {
      display: flex;
      gap: 10px;
    }

    .topbar-actions button,
    .producer-actions button,
    .filters button {
      border: none;
      border-radius: 12px;
      padding: 10px 14px;
      background: #ff8a3d;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .ghost {
      background: #333 !important;
    }

    .filters {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }

    .filters button {
      background: white;
      color: #333;
    }

    .filters button.active {
      background: #ff8a3d;
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin-bottom: 16px;
    }

    .stat-card,
    .extra-card,
    .state,
    .order-card {
      background: white;
      border-radius: 18px;
      padding: 18px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
    }

    .stat-card span {
      display: block;
      color: #666;
      margin-bottom: 8px;
    }

    .stat-card strong {
      font-size: 28px;
    }

    .extra-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 18px;
    }

    .extra-card h3 {
      margin-top: 0;
    }

    .mini-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .state.error {
      background: #fff1f0;
      color: #c23b2f;
    }

    .orders {
      display: grid;
      gap: 18px;
    }

    .order-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .order-info {
      flex: 1;
      min-width: 260px;
    }

    .badge-wrap {
      flex-shrink: 0;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
    }

    .muted {
      color: #777;
      font-size: 14px;
      margin-top: 4px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 36px;
      padding: 8px 14px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 13px;
      line-height: 1;
      white-space: nowrap;
    }

    .badge-pending { background: #fff2e9; color: #ff8a3d; }
    .badge-accepted { background: #eef4ff; color: #2563eb; }
    .badge-ready { background: #ecfdf3; color: #027a48; }
    .badge-completed { background: #f2f4f7; color: #344054; }
    .badge-out { background: #fff1f0; color: #c23b2f; }

    .items {
      display: grid;
      gap: 8px;
      margin-bottom: 14px;
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
      margin-bottom: 14px;
    }

    .producer-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .danger {
      background: #c23b2f !important;
    }

    @media (max-width: 900px) {
      .extra-stats {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  errorMessage = '';
  role = localStorage.getItem('role') || 'buyer';
  statusFilter = 'all';
  stats: any = null;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    if (this.role === 'producer') {
      this.loadStats();
    }
  }

  get filteredOrders(): any[] {
    if (this.role !== 'producer' || this.statusFilter === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.statusFilter);
  }

  setFilter(value: string) {
    this.statusFilter = value;
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
      this.loading = false;
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить заказы.';
      this.cdr.detectChanges();
    }
  }

  async loadStats() {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/producer-stats/', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить статистику');
      }

      this.stats = await response.json();
      this.cdr.detectChanges();
    } catch (error) {
      console.error(error);
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
        body: JSON.stringify({ status })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось обновить статус');
      }

      await this.loadOrders();
      if (this.role === 'producer') {
        await this.loadStats();
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось обновить статус.';
      this.cdr.detectChanges();
    }
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString('ru-RU');
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

  getBadgeClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge-pending',
      accepted: 'badge-accepted',
      ready: 'badge-ready',
      completed: 'badge-completed',
      out_of_stock: 'badge-out'
    };
    return map[status] || 'badge-pending';
  }

  goHome() {
    this.router.navigate([this.role === 'producer' ? '/producer/branches' : '/branches']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}