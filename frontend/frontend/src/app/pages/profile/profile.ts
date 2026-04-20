import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="card">
        <div class="avatar">👤</div>
        <h1>{{ username }}</h1>
        <p class="role">{{ roleLabel }}</p>

        <div class="actions">
          <button (click)="goHome()">Домой</button>
          <button class="logout" (click)="logout()">Выйти</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f7f1ea;
      font-family: Arial, sans-serif;
      padding: 24px;
      box-sizing: border-box;
    }

    .card {
      width: 100%;
      max-width: 420px;
      background: white;
      border-radius: 20px;
      padding: 28px;
      text-align: center;
      box-shadow: 0 12px 30px rgba(0,0,0,0.08);
    }

    .avatar {
      font-size: 56px;
      margin-bottom: 12px;
    }

    h1 {
      margin: 0 0 8px;
    }

    .role {
      color: #666;
      margin-bottom: 22px;
    }

    .actions {
      display: grid;
      gap: 12px;
    }

    button {
      border: none;
      border-radius: 12px;
      padding: 14px 16px;
      background: #ff8a3d;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .logout {
      background: #333;
    }
  `]
})
export class ProfileComponent {
  username = localStorage.getItem('username') || 'Гость';
  role = localStorage.getItem('role') || 'buyer';
  roleLabel = localStorage.getItem('roleLabel') || 'Пользователь';

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate([this.role === 'producer' ? '/producer/branches' : '/branches']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}