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

  constructor(
    private api: ApiService, 
    private router: Router 
  ) {}

  login() {
    this.api.login(this.username, this.password).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.access); 
        localStorage.setItem('username', this.username); // Сохраняем имя для профиля
        
        console.log('Данные входа сохранены');
        alert('Ты вошла! Погнали за сэндвичами 😎');

        // Переходим в меню и обновляем страницу, чтобы Navbar увидел изменения
        this.router.navigate(['/menu']).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        alert('Ошибка логина! Проверь имя пользователя или пароль.');
      }
    });
  }

  register() {
    this.api.register(this.username, this.password).subscribe({
      next: (res: any) => {
        alert('Регистрация успешна! Теперь введи данные и нажми "Войти"');
      },
      error: (err) => {
        alert('Ошибка при регистрации: что-то пошло не так');
      }
    });
  }
}
