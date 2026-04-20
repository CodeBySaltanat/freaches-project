import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="topbar">
        <div>
          <h1>Филиалы Freaches</h1>
          <p>Выбери филиал, чтобы открыть его меню</p>
        </div>

        <div class="topbar-actions">
          <button (click)="openCart()">Корзина ({{ getCartCount() }})</button>
          <button (click)="openFavorites()">Избранное</button>
          <button (click)="openOrders()">Мои заказы</button>
          <button (click)="openProfile()">Профиль</button>
          <button class="ghost" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state" *ngIf="loading">Загружаю филиалы...</div>

      <div class="state error" *ngIf="!loading && errorMessage">
        {{ errorMessage }}
      </div>

      <div class="state" *ngIf="!loading && !errorMessage && branches.length === 0">
        Филиалы пока не добавлены в базу.
      </div>

      <div class="grid" *ngIf="!loading && !errorMessage && branches.length > 0">
        <div class="card" *ngFor="let branch of branches">
          <div>
            <h3>{{ branch.name }}</h3>
            <p>{{ branch.address }}</p>
          </div>
          <button (click)="openBranch(branch)">Открыть меню</button>
        </div>
      </div>

      <div class="coming-soon">
        <h2>Скоро откроем новые филиалы</h2>
        <div class="coming-grid">
          <div class="coming-card">
            <div>
              <strong>TB1</strong>
              <span>Tole bi 1 floor</span>
            </div>
          </div>
          <div class="coming-card">
            <div>
              <strong>TB2</strong>
              <span>Tole bi 2 floor</span>
            </div>
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

    .grid,
    .coming-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 320px));
      gap: 18px;
      justify-content: center;
    }

    .grid {
      margin-bottom: 40px;
    }

    .card,
    .coming-card {
      background: white;
      border-radius: 18px;
      padding: 22px;
      height: 200px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
      text-align: left;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .card h3,
    .coming-card strong {
      display: block;
      margin: 0 0 10px;
      font-size: 22px;
      color: #111;
    }

    .card p,
    .coming-card span {
      margin: 0;
      color: #666;
      display: block;
    }

    .coming-soon {
      margin-top: 30px;
      background: white;
      border-radius: 22px;
      padding: 24px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
    }

    .coming-card {
      background: #fff7f0;
      border: 1px solid #ffd2b3;
      box-shadow: none;
    }
  `]
})
export class BranchesComponent implements OnInit {
  branches: any[] = [];
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

    this.loadBranches();
  }

  async loadBranches() {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/branches/');

      if (!response.ok) {
        throw new Error('Не удалось загрузить филиалы');
      }

      const data = await response.json();
      this.branches = Array.isArray(data) ? data : [];
      this.loading = false;
      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить филиалы.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getCartCount() {
    return this.cartService.getTotalCount();
  }

  openBranch(branch: any) {
    this.router.navigate(['/menu', branch.id]);
  }

  openCart() {
    this.router.navigate(['/cart']);
  }

  openFavorites() {
    this.router.navigate(['/favorites']);
  }

  openOrders() {
    this.router.navigate(['/orders']);
  }

  openProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}