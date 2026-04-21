import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-producer-branches',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="hero">
        <div class="hero__text">
          <span class="badge">Режим производителя</span>
          <h1>Филиалы продавца</h1>
          <p>
            Выбери филиал, чтобы управлять меню, товарами и следить за заказами.
          </p>
        </div>

        <div class="hero__actions">
          <button class="ghost-btn" (click)="openOrders()">Заказы</button>
          <button class="dark-btn" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state" *ngIf="loading">Загружаю филиалы...</div>
      <div class="state error" *ngIf="!loading && errorMessage">{{ errorMessage }}</div>

      <div class="state" *ngIf="!loading && !errorMessage && branches.length === 0">
        Филиалы пока не добавлены.
      </div>

      <div class="grid" *ngIf="!loading && !errorMessage && branches.length > 0">
        <article class="card" *ngFor="let branch of branches; trackBy: trackByBranch">
          <div class="card__top">
            <div class="card__icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 20V7.5C4 6.67 4.67 6 5.5 6H9V4.8C9 3.81 9.81 3 10.8 3H13.2C14.19 3 15 3.81 15 4.8V6H18.5C19.33 6 20 6.67 20 7.5V20"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linejoin="round"
                />
                <path
                  d="M9 20V15.5C9 14.67 9.67 14 10.5 14H13.5C14.33 14 15 14.67 15 15.5V20"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linejoin="round"
                />
                <path d="M8 9H8.01M12 9H12.01M16 9H16.01M8 12H8.01M12 12H12.01M16 12H16.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
              </svg>
            </div>

            <div class="card__info">
              <h3>{{ branch.name }}</h3>
              <p>{{ branch.address }}</p>
              <span class="mini-badge">Управление меню</span>
            </div>
          </div>

          <div class="card__bottom">
            <button (click)="openBranch(branch.id)">Открыть филиал</button>
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
        radial-gradient(circle at 10% 18%, rgba(255, 93, 162, 0.10), transparent 24%),
        radial-gradient(circle at 92% 80%, rgba(255, 167, 204, 0.12), transparent 22%),
        linear-gradient(180deg, #fff8fc 0%, #f9f7ff 100%);
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
      background: rgba(255, 95, 162, 0.10);
      color: #d63384;
      font-weight: 800;
      font-size: 14px;
      border: 1px solid rgba(255, 95, 162, 0.18);
      box-shadow: 0 8px 18px rgba(214, 51, 132, 0.08);
    }

    h1 {
      margin: 14px 0 10px;
      font-size: 58px;
      line-height: 0.98;
      letter-spacing: -1.6px;
      color: #1f1630;
      font-weight: 900;
    }

    p {
      margin: 0;
      color: #6e5c7b;
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
    .card__bottom button {
      border: none;
      border-radius: 16px;
      padding: 13px 16px;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
      font-family: inherit;
    }

    .ghost-btn {
      background: rgba(255, 255, 255, 0.90);
      color: #4a3757;
      border: 1px solid #f0d9e7;
      box-shadow: 0 10px 22px rgba(80, 40, 70, 0.05);
    }

    .dark-btn {
      background: #2a2233;
      color: white;
    }

    .ghost-btn:hover,
    .dark-btn:hover,
    .card__bottom button:hover {
      transform: translateY(-1px);
    }

    .state,
    .card {
      background: rgba(255, 255, 255, 0.97);
      border: 1px solid #f0e4ee;
      border-radius: 26px;
      box-shadow:
        0 18px 36px rgba(80, 40, 70, 0.06),
        0 6px 16px rgba(80, 40, 70, 0.03);
    }

    .state {
      padding: 18px 20px;
      margin-bottom: 20px;
      font-weight: 700;
      color: #5b4c67;
    }

    .state.error {
      color: #b42318;
      background: #fff1f0;
      border-color: #ffd7d2;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }

    .card {
      padding: 22px;
      transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    }

    .card:hover {
      transform: translateY(-4px);
      border-color: #f4bfd6;
      box-shadow:
        0 24px 42px rgba(80, 40, 70, 0.10),
        0 8px 18px rgba(80, 40, 70, 0.04);
    }

    .card__top {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 22px;
    }

    .card__icon {
      width: 58px;
      height: 58px;
      border-radius: 20px;
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #fff0f7, #ffffff);
      border: 1px solid #f7c7de;
      box-shadow: 0 10px 20px rgba(214, 51, 132, 0.10);
      color: #d63384;
    }

    .card__icon svg {
      width: 26px;
      height: 26px;
      display: block;
    }

    .card__info h3 {
      margin: 0 0 8px;
      font-size: 24px;
      line-height: 1.2;
      color: #2c1f38;
      font-weight: 900;
    }

    .card__info p {
      margin: 0 0 12px;
      color: #7b6b88;
      line-height: 1.55;
      font-size: 15px;
    }

    .mini-badge {
      display: inline-flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255, 95, 162, 0.10);
      color: #d63384;
      font-size: 12px;
      font-weight: 800;
      border: 1px solid rgba(255, 95, 162, 0.14);
    }

    .card__bottom {
      display: flex;
      justify-content: flex-start;
    }

    .card__bottom button {
      background: linear-gradient(135deg, #ff5fa2, #ff8cc6);
      color: white;
      box-shadow: 0 14px 26px rgba(255, 95, 162, 0.24);
    }

    @media (max-width: 980px) {
      .page {
        padding: 24px 18px;
      }

      .hero {
        flex-direction: column;
        align-items: start;
      }

      h1 {
        font-size: 42px;
        line-height: 1;
        letter-spacing: -1px;
      }

      .hero__actions {
        width: 100%;
      }

      .hero__actions button {
        flex: 1 1 auto;
      }

      .grid {
        grid-template-columns: 1fr;
      }
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
    if (localStorage.getItem('role') !== 'producer') {
      this.router.navigate(['/branches']);
      return;
    }

    this.loadBranches();
  }

  trackByBranch = (_: number, branch: any) => branch.id;

  async loadBranches(): Promise<void> {
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
      this.errorMessage =
        error instanceof Error ? error.message : 'Ошибка загрузки филиалов';
      this.cdr.detectChanges();
    }
  }

  openBranch(branchId: number): void {
    this.router.navigate(['/producer/menu', branchId]);
  }

  openOrders(): void {
    this.router.navigate(['/orders']);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}