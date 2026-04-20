import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-producer-branches',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="topbar">
        <div>
          <h1>Филиалы продавца</h1>
          <p>Выбери филиал, чтобы управлять его меню</p>
        </div>

        <div class="topbar-actions">
          <button (click)="openOrders()">Заказы</button>
          <button class="ghost" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state" *ngIf="loading">Загружаю филиалы...</div>

      <div class="state error" *ngIf="!loading && errorMessage">
        {{ errorMessage }}
      </div>

      <div class="grid" *ngIf="!loading && !errorMessage && branches.length > 0">
        <div class="card" *ngFor="let branch of branches">
          <h3>{{ branch.name }}</h3>
          <p>{{ branch.address }}</p>
          <button (click)="openBranch(branch.id)">Управлять меню</button>
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
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 18px;
    }

    .card {
      background: white;
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
    }

    .card h3 {
      margin: 0 0 10px;
    }

    .card p {
      margin: 0 0 18px;
      min-height: 44px;
    }
  `]
})
export class ProducerBranchesComponent implements OnInit {
  branches: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
      this.loading = false;
      this.errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки филиалов';
      this.cdr.detectChanges();
    }
  }

  openBranch(branchId: number) {
    this.router.navigate(['/producer/menu', branchId]);
  }

  openOrders() {
    this.router.navigate(['/orders']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}