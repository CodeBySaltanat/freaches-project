import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface OrderItem {
  product_name: string;
  quantity: number;
}

interface Order {
  id: number;
  buyer_order_number?: number;
  created_at: string;
  user_name?: string;
  address?: string;
  comment?: string;
  status: string;
  total?: number;
  items?: OrderItem[];
}

interface ProducerStats {
  total_orders: number;
  new_orders: number;
  ready_orders: number;
  out_of_stock_orders: number;
  popular_products?: Array<{ name: string; total_qty: number }>;
  orders_by_branch?: Array<{ branch_name: string; order_count: number }>;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="hero">
        <div class="hero__text">
          <span class="badge">{{ isProducer ? 'Producer mode' : 'Buyer mode' }}</span>
          <h1>Заказы</h1>
          <p>
            {{ isProducer
              ? 'Управляй входящими заказами, меняй статусы и следи за статистикой.'
              : 'Здесь отображаются все твои оформленные заказы и их текущие статусы.' }}
          </p>
        </div>

        <div class="hero__actions">
          <button class="ghost-btn" (click)="goHome()">Домой</button>
          <button class="dark-btn" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state success" *ngIf="successMessage">{{ successMessage }}</div>
      <div class="state error" *ngIf="errorMessage">{{ errorMessage }}</div>

      <div class="stats-grid" *ngIf="isProducer && stats">
        <div class="stat-card">
          <span>Всего заказов</span>
          <strong>{{ stats.total_orders || 0 }}</strong>
        </div>

        <div class="stat-card">
          <span>Новые</span>
          <strong>{{ stats.new_orders || 0 }}</strong>
        </div>

        <div class="stat-card">
          <span>Готовые</span>
          <strong>{{ stats.ready_orders || 0 }}</strong>
        </div>

        <div class="stat-card">
          <span>Нет в наличии</span>
          <strong>{{ stats.out_of_stock_orders || 0 }}</strong>
        </div>
      </div>

      <div class="extra-stats" *ngIf="isProducer && stats">
        <div class="extra-card">
          <h3>Популярные товары</h3>

          <div class="mini-row" *ngFor="let item of stats.popular_products || []">
            <span>{{ item.name }}</span>
            <strong>{{ item.total_qty }}</strong>
          </div>

          <div class="mini-empty" *ngIf="!(stats.popular_products?.length)">
            Пока данных нет.
          </div>
        </div>

        <div class="extra-card">
          <h3>Заказы по филиалам</h3>

          <div class="mini-row" *ngFor="let item of stats.orders_by_branch || []">
            <span>{{ item.branch_name }}</span>
            <strong>{{ item.order_count }}</strong>
          </div>

          <div class="mini-empty" *ngIf="!(stats.orders_by_branch?.length)">
            Пока данных нет.
          </div>
        </div>
      </div>

      <div class="filters" *ngIf="isProducer">
        <button [class.active]="statusFilter === 'all'" (click)="setFilter('all')">Все</button>
        <button [class.active]="statusFilter === 'pending'" (click)="setFilter('pending')">Новые</button>
        <button [class.active]="statusFilter === 'accepted'" (click)="setFilter('accepted')">Приняты</button>
        <button [class.active]="statusFilter === 'ready'" (click)="setFilter('ready')">Готовые</button>
        <button [class.active]="statusFilter === 'out_of_stock'" (click)="setFilter('out_of_stock')">Нет в наличии</button>
        <button [class.active]="statusFilter === 'completed'" (click)="setFilter('completed')">Полученные</button>
      </div>

      <div class="state" *ngIf="loading">Загружаю заказы...</div>

      <div class="state" *ngIf="!loading && !errorMessage && filteredOrders.length === 0">
        Заказов пока нет.
      </div>

      <div class="orders" *ngIf="!loading && !errorMessage && filteredOrders.length > 0">
        <article class="order-card" *ngFor="let order of filteredOrders; trackBy: trackByOrder">
          <div class="order-top">
            <div class="order-info">
              <h3 *ngIf="!isProducer">Заказ #{{ order.buyer_order_number || order.id }}</h3>
              <h3 *ngIf="isProducer">Заказ #{{ order.id }} · у покупателя #{{ order.buyer_order_number || order.id }}</h3>

              <p class="muted">{{ formatDate(order.created_at) }}</p>
              <p class="muted" *ngIf="isProducer && order.user_name">Покупатель: {{ order.user_name }}</p>
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

          <div class="producer-actions" *ngIf="isProducer">
            <button
              class="action-btn"
              *ngIf="order.status === 'pending'"
              (click)="updateStatus(order.id, 'accepted')"
            >
              Принять
            </button>

            <button
              class="action-btn danger"
              *ngIf="order.status === 'pending' || order.status === 'accepted'"
              (click)="updateStatus(order.id, 'out_of_stock')"
            >
              Нет в наличии
            </button>

            <button
              class="action-btn"
              *ngIf="order.status === 'accepted'"
              (click)="updateStatus(order.id, 'ready')"
            >
              Готово
            </button>

            <button
              class="action-btn"
              *ngIf="order.status === 'ready'"
              (click)="updateStatus(order.id, 'completed')"
            >
              Получено
            </button>
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
      max-width: 760px;
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

    h3 {
      margin: 0;
      color: #172335;
      font-weight: 900;
      font-size: 22px;
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
    .dark-btn,
    .filters button,
    .action-btn {
      border: none;
      border-radius: 16px;
      padding: 12px 16px;
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

    .dark-btn {
      background: #1f2937;
      color: white;
    }

    .ghost-btn:hover,
    .dark-btn:hover,
    .filters button:hover,
    .action-btn:hover {
      transform: translateY(-1px);
    }

    .state,
    .stat-card,
    .extra-card,
    .order-card {
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

    .state.success {
      color: #027a48;
      background: #ecfdf3;
      border-color: #c7f0d7;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat-card {
      padding: 20px;
    }

    .stat-card span {
      display: block;
      color: #73839a;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .stat-card strong {
      font-size: 32px;
      color: #111827;
      font-weight: 900;
    }

    .extra-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 18px;
    }

    .extra-card {
      padding: 20px;
    }

    .extra-card h3 {
      margin: 0 0 12px;
      font-size: 22px;
    }

    .mini-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #eef2f7;
      color: #42546f;
    }

    .mini-row strong {
      color: #111827;
    }

    .mini-empty {
      color: #73839a;
      font-weight: 700;
      padding-top: 4px;
    }

    .filters {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }

    .filters button {
      background: rgba(255, 255, 255, 0.88);
      color: #344054;
      border: 1px solid #dfe7f2;
      box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
    }

    .filters button.active {
      background: linear-gradient(135deg, #2f6cff, #57b8ff);
      color: white;
      border-color: transparent;
      box-shadow: 0 14px 28px rgba(47, 108, 255, 0.22);
    }

    .orders {
      display: grid;
      gap: 18px;
    }

    .order-card {
      padding: 20px;
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
      color: #73839a;
      font-size: 14px;
      margin-top: 4px;
      line-height: 1.5;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 36px;
      padding: 8px 14px;
      border-radius: 999px;
      font-weight: 800;
      font-size: 13px;
      line-height: 1;
      white-space: nowrap;
    }

    .badge-pending {
      background: #fff2e9;
      color: #ff8a3d;
    }

    .badge-accepted {
      background: #eef4ff;
      color: #2563eb;
    }

    .badge-ready {
      background: #ecfdf3;
      color: #027a48;
    }

    .badge-completed {
      background: #f2f4f7;
      color: #344054;
    }

    .badge-out {
      background: #fff1f0;
      color: #c23b2f;
    }

    .items {
      display: grid;
      gap: 8px;
      margin-bottom: 14px;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      background: #f8fbff;
      border: 1px solid #e5edf8;
      border-radius: 14px;
      color: #344054;
      font-weight: 700;
    }

    .total {
      font-size: 22px;
      font-weight: 900;
      margin-bottom: 14px;
      color: #111827;
    }

    .producer-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .action-btn {
      background: linear-gradient(135deg, #2f6cff, #57b8ff);
      color: white;
      box-shadow: 0 14px 28px rgba(47, 108, 255, 0.22);
    }

    .action-btn.danger {
      background: #fff1f0;
      color: #b42318;
      border: 1px solid #ffd8d3;
      box-shadow: none;
    }

    @media (max-width: 980px) {
      .page {
        padding: 24px 18px;
      }

      h1 {
        font-size: 42px;
        line-height: 1;
        letter-spacing: -1px;
      }

      .hero {
        flex-direction: column;
        align-items: start;
      }

      .hero__actions {
        width: 100%;
      }

      .hero__actions button {
        flex: 1 1 auto;
      }

      .extra-stats {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';
  role = localStorage.getItem('role') || 'buyer';
  statusFilter = 'all';
  stats: ProducerStats | null = null;

  private successTimer?: number;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get isProducer(): boolean {
    return this.role === 'producer';
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadInitialData();
  }

  ngOnDestroy(): void {
    if (this.successTimer) {
      window.clearTimeout(this.successTimer);
    }
  }

  trackByOrder = (_: number, order: Order) => order.id;

  get filteredOrders(): Order[] {
    if (!this.isProducer || this.statusFilter === 'all') {
      return this.orders;
    }

    return this.orders.filter(order => order.status === this.statusFilter);
  }

  setFilter(value: string): void {
    this.statusFilter = value;
  }

  async loadInitialData(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      await Promise.all([
        this.loadOrders(false),
        this.isProducer ? this.loadStats(false) : Promise.resolve()
      ]);

      this.loading = false;
      this.cdr.detectChanges();
    } catch (error) {
      this.loading = false;
      this.errorMessage =
        error instanceof Error ? error.message : 'Не удалось загрузить данные.';
      this.cdr.detectChanges();
    }
  }

  async loadOrders(updateView = true): Promise<void> {
    const token = localStorage.getItem('token');

    const response = await fetch('http://127.0.0.1:8000/api/orders/', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });

    if (!response.ok) {
      throw new Error('Не удалось загрузить заказы');
    }

    const data = await response.json();
    this.orders = Array.isArray(data) ? data : [];

    if (updateView) {
      this.cdr.detectChanges();
    }
  }

  async loadStats(updateView = true): Promise<void> {
    const token = localStorage.getItem('token');

    const response = await fetch('http://127.0.0.1:8000/api/producer-stats/', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });

    if (!response.ok) {
      throw new Error('Не удалось загрузить статистику');
    }

    this.stats = await response.json();

    if (updateView) {
      this.cdr.detectChanges();
    }
  }

  async updateStatus(orderId: number, status: string): Promise<void> {
    try {
      this.errorMessage = '';
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/orders/' + orderId + '/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось обновить статус');
      }

      await this.loadOrders(false);

      if (this.isProducer) {
        await this.loadStats(false);
      }

      this.showSuccess('Статус заказа обновлён');
      this.cdr.detectChanges();
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Не удалось обновить статус.';
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

  goHome(): void {
    this.router.navigate([this.isProducer ? '/producer/branches' : '/branches']);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';

    if (this.successTimer) {
      window.clearTimeout(this.successTimer);
    }

    this.successTimer = window.setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 2200);
  }
}