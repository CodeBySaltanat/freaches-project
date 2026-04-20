import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="card">
        <h1>Freaches</h1>
        <p class="subtitle">Вход и регистрация с ролями buyer / producer</p>

        <div class="tabs">
          <button type="button" [class.active]="mode === 'login'" (click)="switchMode('login')">
            Вход
          </button>
          <button type="button" [class.active]="mode === 'register'" (click)="switchMode('register')">
            Регистрация
          </button>
        </div>

        <div class="message error" *ngIf="errorMessage">{{ errorMessage }}</div>
        <div class="message success" *ngIf="successMessage">{{ successMessage }}</div>

        <div class="field">
          <label>Логин</label>
          <input [(ngModel)]="username" placeholder="Например, saltanat" />
        </div>

        <div class="field">
          <label>Пароль</label>
          <input [(ngModel)]="password" type="password" placeholder="Минимум 6 символов" />
        </div>

        <div *ngIf="mode === 'register'">
          <div class="field">
            <label>Подтверждение пароля</label>
            <input [(ngModel)]="confirmPassword" type="password" placeholder="Повтори пароль" />
          </div>

          <div class="roles">
            <button type="button" [class.selected]="role === 'buyer'" (click)="role = 'buyer'">
              Покупатель
            </button>
            <button type="button" [class.selected]="role === 'producer'" (click)="role = 'producer'">
              Производитель
            </button>
          </div>
        </div>

        <button class="submit" (click)="submit()" [disabled]="loading">
          {{ loading ? 'Подожди...' : (mode === 'login' ? 'Войти' : 'Создать аккаунт') }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: #f7f1ea;
      font-family: Arial, sans-serif;
      box-sizing: border-box;
    }

    .card {
      width: 100%;
      max-width: 430px;
      background: #fff;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.08);
    }

    h1 {
      margin: 0 0 8px;
      font-size: 32px;
    }

    .subtitle {
      margin: 0 0 18px;
      color: #666;
    }

    .tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 18px;
    }

    .tabs button {
      border: none;
      border-radius: 12px;
      padding: 12px;
      background: #efefef;
      font-weight: 700;
      cursor: pointer;
    }

    .tabs button.active {
      background: #ff8a3d;
      color: white;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 14px;
    }

    label {
      font-weight: 700;
    }

    input {
      padding: 12px 14px;
      border: 1px solid #d8d8d8;
      border-radius: 12px;
      font-size: 15px;
    }

    .roles {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }

    .roles button {
      border: 1px solid #d8d8d8;
      border-radius: 12px;
      padding: 12px;
      background: white;
      font-weight: 700;
      cursor: pointer;
    }

    .roles button.selected {
      border-color: #ff8a3d;
      background: #fff2e9;
    }

    .submit {
      width: 100%;
      border: none;
      border-radius: 12px;
      padding: 14px;
      background: #ff8a3d;
      color: white;
      font-weight: 800;
      cursor: pointer;
    }

    .submit:disabled {
      opacity: 0.7;
      cursor: wait;
    }

    .message {
      padding: 12px;
      border-radius: 12px;
      margin-bottom: 14px;
      font-weight: 600;
    }

    .message.error {
      background: #fff1f0;
      color: #c23b2f;
    }

    .message.success {
      background: #effaf1;
      color: #207a3c;
    }
  `]
})
export class LoginComponent implements OnInit {
  mode: 'login' | 'register' = 'login';

  username = '';
  password = '';
  confirmPassword = '';
  role: 'buyer' | 'producer' = 'buyer';

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      this.redirectByRole();
      return;
    }

    if (token && !role) {
      localStorage.clear();
    }
  }

  switchMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Введите логин и пароль.';
      return;
    }

    if (this.mode === 'register') {
      this.register();
      return;
    }

    this.login();
  }

  private login() {
    this.loading = true;

    this.api.login(this.username.trim(), this.password).subscribe({
      next: (response: any) => {
        this.api.saveSession(response);
        this.loading = false;
        this.redirectByRole();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Не удалось войти. Проверь логин и пароль.';
      }
    });
  }

  private register() {
    if (this.password.length < 6) {
      this.errorMessage = 'Пароль должен быть минимум из 6 символов.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Пароли не совпадают.';
      return;
    }

    this.loading = true;

    this.api.register(this.username.trim(), this.password, this.role).subscribe({
      next: () => {
        this.successMessage = 'Регистрация успешна. Выполняю вход...';

        this.api.login(this.username.trim(), this.password).subscribe({
          next: (response: any) => {
            this.api.saveSession(response);
            this.loading = false;
            this.redirectByRole();
          },
          error: () => {
            this.loading = false;
            this.switchMode('login');
            this.successMessage = 'Аккаунт создан. Теперь просто войди.';
          }
        });
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.username?.[0] ||
          error?.error?.password?.[0] ||
          error?.error?.role?.[0] ||
          error?.error?.error ||
          'Не удалось зарегистрироваться.';
      }
    });
  }
  private redirectByRole() {
    const role = this.api.getRole();
    this.router.navigate([role === 'producer' ? '/producer/branches' : '/branches']);
  }
}