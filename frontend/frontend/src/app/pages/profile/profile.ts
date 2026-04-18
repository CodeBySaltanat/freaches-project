import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent {
  username = localStorage.getItem('username') || 'Гость';

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');    
    localStorage.removeItem('username'); 
    alert('Вы вышли из аккаунта 🐾');
    
    this.router.navigate(['/login']).then(() => {
        window.location.reload();
    });
  }
}