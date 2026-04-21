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
    <div class="auth-shell">
      <div class="kbtu-badge">
        <div class="kbtu-badge__dot"></div>
        <span>KBTU project</span>
      </div>

      <div class="auth-page">
        <section class="auth-hero">
          <span class="auth-badge">Freaches</span>

          <h1>
            Один вход —
            <br />
            два режима работы
          </h1>

          <p class="auth-description">
            Покупатель оформляет заказ и отслеживает статус.
            Производитель управляет филиалами, меню и входящими заказами.
          </p>

          <div class="hero-cards">
            <article class="hero-card">
              <div class="hero-card__icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 8h12l-1 11H7L6 8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  <path d="M9 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="hero-card__content">
                <strong>Buyer mode</strong>
                <span>Корзина, избранное, заказы, профиль</span>
              </div>
            </article>

            <article class="hero-card hero-card--offset">
              <div class="hero-card__icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 10.5 5.5 6h13L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  <path d="M5 10v8h14v-8" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  <path d="M9 18v-4h6v4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="hero-card__content">
                <strong>Producer mode</strong>
                <span>Филиалы, меню, статусы заказов</span>
              </div>
            </article>
          </div>

          <div class="hero-marquee">
            <div class="hero-marquee__track">
              <span class="chip" *ngFor="let item of heroChips">{{ item }}</span>
              <span class="chip" *ngFor="let item of heroChips">{{ item }}</span>
            </div>
          </div>
        </section>

        <section class="auth-card">
          <div class="tabs">
            <div class="tabs__slider" [class.is-register]="mode === 'register'"></div>

            <button
              type="button"
              class="tabs__btn"
              [class.active]="mode === 'login'"
              (click)="switchMode('login')"
            >
              Вход
            </button>

            <button
              type="button"
              class="tabs__btn"
              [class.active]="mode === 'register'"
              (click)="switchMode('register')"
            >
              Регистрация
            </button>
          </div>

          <h2>{{ mode === 'login' ? 'Добро пожаловать' : 'Создание аккаунта' }}</h2>
          <p class="card-subtitle">
            {{ mode === 'login'
              ? 'Войди, чтобы открыть свой рабочий режим'
              : 'Создай аккаунт и выбери нужную роль' }}
          </p>

          <div class="message error" *ngIf="errorMessage">{{ errorMessage }}</div>
          <div class="message success" *ngIf="successMessage">{{ successMessage }}</div>

          <div class="field">
            <label>Логин</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="1.8"/>
                  <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </span>
              <input [(ngModel)]="username" placeholder="Например, saltanat" />
            </div>
          </div>

          <div class="field">
            <label>Пароль</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="9" rx="2.5" stroke="currentColor" stroke-width="1.8"/>
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </span>

              <input
                [(ngModel)]="password"
                [type]="showPassword ? 'text' : 'password'"
                placeholder="Минимум 6 символов"
              />

              <button
                type="button"
                class="input-action"
                (click)="togglePassword()"
                aria-label="Показать или скрыть пароль"
              >
                <svg *ngIf="!showPassword" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
                </svg>
                <svg *ngIf="showPassword" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 3l18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  <path d="M10.6 6.1A9.7 9.7 0 0 1 12 6c6 0 9.5 6 9.5 6a16.5 16.5 0 0 1-4 4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  <path d="M6.2 6.8C3.8 8.4 2.5 12 2.5 12S6 18 12 18c1.6 0 3-.3 4.2-.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  <path d="M9.9 9.9A3 3 0 0 0 14.1 14.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div *ngIf="mode === 'register'">
            <div class="field">
              <label>Подтверждение пароля</label>
              <div class="input-wrap">
                <span class="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="9" rx="2.5" stroke="currentColor" stroke-width="1.8"/>
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </span>

                <input
                  [(ngModel)]="confirmPassword"
                  [type]="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Повтори пароль"
                />

                <button
                  type="button"
                  class="input-action"
                  (click)="toggleConfirmPassword()"
                  aria-label="Показать или скрыть подтверждение пароля"
                >
                  <svg *ngIf="!showConfirmPassword" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
                  </svg>
                  <svg *ngIf="showConfirmPassword" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 3l18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M10.6 6.1A9.7 9.7 0 0 1 12 6c6 0 9.5 6 9.5 6a16.5 16.5 0 0 1-4 4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M6.2 6.8C3.8 8.4 2.5 12 2.5 12S6 18 12 18c1.6 0 3-.3 4.2-.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M9.9 9.9A3 3 0 0 0 14.1 14.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="role-picker">
              <button
                type="button"
                class="role-card"
                [class.selected]="role === 'buyer'"
                (click)="role = 'buyer'"
              >
                <div class="role-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 8h12l-1 11H7L6 8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                    <path d="M9 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="role-card__content">
                  <strong>Покупатель</strong>
                  <span>Выбор филиала и заказ</span>
                </div>
              </button>

              <button
                type="button"
                class="role-card"
                [class.selected]="role === 'producer'"
                (click)="role = 'producer'"
              >
                <div class="role-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 10.5 5.5 6h13L20 10.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                    <path d="M5 10v8h14v-8" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                    <path d="M9 18v-4h6v4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="role-card__content">
                  <strong>Производитель</strong>
                  <span>Меню и входящие заказы</span>
                </div>
              </button>
            </div>
          </div>

          <button class="primary-btn" (click)="submit()" [disabled]="loading">
            {{ loading ? 'Подожди...' : (mode === 'login' ? 'Войти' : 'Создать аккаунт') }}
          </button>

          <div class="auth-note">
            {{ mode === 'login'
              ? 'После входа система сама направит тебя в нужный раздел'
              : 'Роль выбирается при регистрации нового аккаунта' }}
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    * {
      box-sizing: border-box;
    }

    .auth-shell {
      min-height: 100vh;
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(circle at 8% 20%, rgba(65, 122, 255, 0.08), transparent 26%),
        radial-gradient(circle at 92% 78%, rgba(95, 183, 255, 0.12), transparent 24%),
        linear-gradient(180deg, #f8fafc 0%, #f3f7fc 100%);
    }

    .auth-shell::before,
    .auth-shell::after {
      content: '';
      position: absolute;
      border-radius: 999px;
      filter: blur(45px);
      pointer-events: none;
    }

    .auth-shell::before {
      width: 260px;
      height: 260px;
      background: rgba(48, 108, 255, 0.10);
      top: -60px;
      left: -40px;
    }

    .auth-shell::after {
      width: 320px;
      height: 320px;
      background: rgba(82, 182, 255, 0.12);
      right: -90px;
      bottom: -90px;
    }

    .kbtu-badge {
      position: absolute;
      top: 26px;
      right: 30px;
      z-index: 3;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.84);
      border: 1px solid #dde6f3;
      box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
      backdrop-filter: blur(10px);
      font-size: 13px;
      font-weight: 800;
      color: #22324a;
    }

    .kbtu-badge__dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: linear-gradient(135deg, #2250ff, #58b8ff);
      box-shadow: 0 0 0 6px rgba(34, 80, 255, 0.10);
    }

    .auth-page {
      position: relative;
      z-index: 1;
      min-height: 100vh;
      max-width: 1400px;
      margin: 0 auto;
      padding: 48px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 470px;
      gap: 64px;
      align-items: center;
    }

    .auth-hero {
      max-width: 720px;
    }

    .auth-badge {
      display: inline-flex;
      align-items: center;
      padding: 10px 16px;
      border-radius: 999px;
      background: rgba(37, 90, 255, 0.08);
      border: 1px solid rgba(37, 90, 255, 0.14);
      color: #255ae6;
      font-size: 15px;
      font-weight: 800;
      margin-bottom: 22px;
    }

    .auth-hero h1 {
      margin: 0;
      font-size: 78px;
      line-height: 0.95;
      letter-spacing: -2.4px;
      color: #111827;
      font-weight: 900;
    }

    .auth-description {
      margin: 24px 0 0;
      max-width: 620px;
      font-size: 21px;
      line-height: 1.65;
      color: #5b6b84;
    }

    .hero-cards {
      position: relative;
      margin-top: 34px;
      width: fit-content;
      display: grid;
      gap: 16px;
    }

    .hero-card {
      width: 340px;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #e5ecf5;
      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.06);
      backdrop-filter: blur(10px);
      transition: transform 0.22s ease, box-shadow 0.22s ease;
    }

    .hero-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 22px 42px rgba(15, 23, 42, 0.09);
    }

    .hero-card--offset {
      margin-left: 42px;
    }

    .hero-card__icon,
    .role-card__icon,
    .input-icon {
      color: #2f6cff;
    }

    .hero-card__icon {
      width: 52px;
      height: 52px;
      border-radius: 18px;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #edf4ff, #ffffff);
      box-shadow: inset 0 0 0 1px #e1e9f4;
      flex: 0 0 auto;
    }

    .hero-card__icon svg,
    .role-card__icon svg,
    .input-icon svg,
    .input-action svg {
      width: 22px;
      height: 22px;
      display: block;
    }

    .hero-card__content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .hero-card__content strong {
      font-size: 17px;
      color: #18263b;
      font-weight: 900;
    }

    .hero-card__content span {
      font-size: 13px;
      color: #74839a;
      line-height: 1.45;
    }

    .hero-marquee {
      margin-top: 28px;
      max-width: 640px;
      overflow: hidden;
      mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
      -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
    }

    .hero-marquee__track {
      display: flex;
      align-items: center;
      gap: 10px;
      width: max-content;
      animation: marqueeMove 20s linear infinite;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.88);
      border: 1px solid #e3eaf4;
      color: #42546f;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
      white-space: nowrap;
    }

    .auth-card {
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid #e2e9f3;
      border-radius: 30px;
      padding: 28px;
      box-shadow:
        0 26px 56px rgba(15, 23, 42, 0.10),
        0 6px 18px rgba(15, 23, 42, 0.04);
      backdrop-filter: blur(12px);
    }

    .tabs {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: #edf3fb;
      padding: 6px;
      border-radius: 18px;
      margin-bottom: 22px;
      overflow: hidden;
    }

    .tabs__slider {
      position: absolute;
      top: 6px;
      left: 6px;
      width: calc(50% - 10px);
      height: calc(100% - 12px);
      border-radius: 14px;
      background: linear-gradient(135deg, #2f6cff, #57b8ff);
      box-shadow: 0 12px 22px rgba(47, 108, 255, 0.20);
      transition: transform 0.26s ease;
    }

    .tabs__slider.is-register {
      transform: translateX(100%);
    }

    .tabs__btn {
      position: relative;
      z-index: 1;
      border: none;
      background: transparent;
      border-radius: 14px;
      padding: 14px 16px;
      font-size: 17px;
      font-weight: 800;
      color: #56708f;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .tabs__btn.active {
      color: white;
    }

    .auth-card h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 900;
      color: #151d2b;
    }

    .card-subtitle {
      margin: 8px 0 18px;
      font-size: 14px;
      line-height: 1.5;
      color: #7a889d;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 14px;
    }

    .field label {
      font-size: 15px;
      font-weight: 800;
      color: #1c2940;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      display: grid;
      place-items: center;
      opacity: 0.88;
      pointer-events: none;
    }

    .field input {
      width: 100%;
      border: 1px solid #d8e3f2;
      background: #f8fbff;
      border-radius: 16px;
      padding: 15px 56px 15px 42px;
      font-size: 16px;
      color: #102038;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    .field input::placeholder {
      color: #94a3b8;
    }

    .field input:focus {
      background: white;
      border-color: #7aa8ff;
      box-shadow: 0 0 0 4px rgba(63, 127, 255, 0.12);
    }

    .input-action {
      position: absolute;
      right: 10px;
      width: 34px;
      height: 34px;
      border: none;
      background: rgba(47, 108, 255, 0.08);
      color: #2d63dd;
      border-radius: 12px;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: 0.2s ease;
      padding: 0;
    }

    .input-action:hover {
      background: rgba(47, 108, 255, 0.14);
    }

    .role-picker {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 10px 0 18px;
    }

    .role-card {
      border: 1px solid #dbe4f3;
      background: #f8fbff;
      border-radius: 18px;
      padding: 14px;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: 0.22s ease;
    }

    .role-card:hover {
      border-color: #8fb3ff;
      background: #f4f8ff;
      transform: translateY(-1px);
    }

    .role-card.selected {
      border-color: #2f6cff;
      background: rgba(47, 108, 255, 0.08);
      box-shadow: inset 0 0 0 1px rgba(47, 108, 255, 0.10);
    }

    .role-card__icon {
      width: 44px;
      height: 44px;
      border-radius: 15px;
      display: grid;
      place-items: center;
      background: white;
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
      flex: 0 0 auto;
    }

    .role-card__content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .role-card__content strong {
      font-size: 16px;
      color: #19253a;
      font-weight: 900;
    }

    .role-card__content span {
      font-size: 12px;
      color: #73839a;
      line-height: 1.35;
    }

    .primary-btn {
      width: 100%;
      border: none;
      border-radius: 18px;
      padding: 16px;
      background: linear-gradient(135deg, #2f6cff, #57b8ff);
      color: white;
      font-size: 17px;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 16px 30px rgba(47, 108, 255, 0.24);
      transition: transform 0.22s ease, box-shadow 0.22s ease, opacity 0.22s ease;
    }

    .primary-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 20px 36px rgba(47, 108, 255, 0.30);
    }

    .primary-btn:disabled {
      opacity: 0.72;
      cursor: wait;
      transform: none;
      box-shadow: none;
    }

    .auth-note {
      margin-top: 12px;
      text-align: center;
      color: #7d8ca2;
      font-size: 13px;
      line-height: 1.45;
    }

    .message {
      border-radius: 14px;
      padding: 12px 14px;
      margin-bottom: 14px;
      font-size: 14px;
      font-weight: 700;
    }

    .message.error {
      background: #fff1f0;
      color: #c23b2f;
      border: 1px solid #ffd7d2;
    }

    .message.success {
      background: #eefaf2;
      color: #207a3c;
      border: 1px solid #cfe9d7;
    }

    @keyframes marqueeMove {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-50%);
      }
    }

    @media (max-width: 1180px) {
      .auth-page {
        grid-template-columns: 1fr;
        gap: 34px;
        justify-items: center;
        padding-top: 100px;
      }

      .auth-hero {
        text-align: center;
      }

      .auth-description {
        margin-left: auto;
        margin-right: auto;
      }

      .auth-hero h1 {
        font-size: 58px;
      }

      .hero-cards {
        margin-left: auto;
        margin-right: auto;
      }

      .auth-card {
        width: 100%;
        max-width: 470px;
      }
    }

    @media (max-width: 720px) {
      .auth-page {
        padding: 88px 18px 24px;
      }

      .kbtu-badge {
        top: 18px;
        right: 18px;
        padding: 8px 12px;
      }

      .auth-hero h1 {
        font-size: 42px;
        line-height: 1;
        letter-spacing: -1.2px;
      }

      .auth-description {
        font-size: 17px;
      }

      .hero-card,
      .hero-card--offset {
        width: 100%;
        margin-left: 0;
      }

      .auth-card {
        padding: 20px;
        border-radius: 24px;
      }

      .tabs__btn {
        font-size: 15px;
        padding: 13px 10px;
      }

      .role-picker {
        grid-template-columns: 1fr;
      }

      .chip {
        font-size: 13px;
      }
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

  showPassword = false;
  showConfirmPassword = false;

  heroChips = [
    'Заказы',
    'Филиалы',
    'Меню',
    'Избранное',
    'Доставка',
    'Статусы'
  ];

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
    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
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