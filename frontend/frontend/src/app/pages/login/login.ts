import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = '';
  password = '';
  message = '';
  error = '';
  isLoading = false;

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  private clearMessages() {
    this.message = '';
    this.error = '';
  }

  login() {
    this.clearMessages();

    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'Введите логин и пароль.';
      return;
    }

    this.isLoading = true;

    this.api.login(this.username.trim(), this.password).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.access);
        localStorage.setItem('username', this.username.trim());

        this.message = 'Вход выполнен успешно.';
        this.isLoading = false;

        this.router.navigate(['/menu']).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        this.isLoading = false;

        if (err.status === 401) {
          this.error = 'Неверный логин или пароль.';
        } else if (err.status === 400) {
          this.error = 'Проверь введённые данные.';
        } else {
          this.error = err?.error?.detail || 'Ошибка входа. Попробуй ещё раз.';
        }

        console.log('LOGIN ERROR:', err);
      }
    });
  }

  register() {
    this.clearMessages();

    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'Для регистрации введи логин и пароль.';
      return;
    }

    if (this.password.trim().length < 4) {
      this.error = 'Пароль должен быть минимум 4 символа.';
      return;
    }

    this.isLoading = true;

    this.api.register(this.username.trim(), this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.message = 'Регистрация успешна. Теперь нажми "Войти".';
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.error || 'Ошибка при регистрации.';
        console.log('REGISTER ERROR:', err);
      }
    });
  }
}