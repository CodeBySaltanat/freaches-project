import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  loading = true;
  errorMessage = '';
  successMessage = '';

  profile: any = null;
  recentOrders: any[] = [];

  fullName = '';
  phone = '';
  newAddress = '';
  savedAddresses: string[] = [];

  role = localStorage.getItem('role') || 'buyer';

  private successTimer?: number;

  constructor(
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfile();
  }

  ngOnDestroy(): void {
    if (this.successTimer) {
      window.clearTimeout(this.successTimer);
    }
  }

  async loadProfile(): Promise<void> {
    try {
      this.loading = true;
      this.errorMessage = '';
      this.cdr.detectChanges();

      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/profile/', {
        headers: {
          Authorization: 'Bearer ' + token
        }
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить профиль');
      }

      const data = await response.json();

      this.profile = data;
      this.recentOrders = Array.isArray(data.recent_orders) ? data.recent_orders : [];
      this.fullName = data.full_name || '';
      this.phone = data.phone || '';
      this.savedAddresses = Array.isArray(data.saved_addresses) ? data.saved_addresses : [];

      this.loading = false;
      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (error) {
      this.loading = false;
      this.errorMessage =
        error instanceof Error ? error.message : 'Не удалось загрузить профиль.';
      this.cdr.detectChanges();
    }
  }

  getCartCount(): number {
    return this.cartService.getTotalCount();
  }

  getAvatarText(): string {
    const source = String(this.fullName || this.profile?.username || 'U').trim();
    if (!source) return 'U';

    const parts = source.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return source.slice(0, 1).toUpperCase();
  }

  addAddress(): void {
    const value = this.newAddress.trim();

    if (!value) return;
    if (this.savedAddresses.includes(value)) {
      this.newAddress = '';
      return;
    }

    this.savedAddresses = [...this.savedAddresses, value];
    this.newAddress = '';
    this.cdr.detectChanges();
  }

  removeAddress(index: number): void {
    this.savedAddresses = this.savedAddresses.filter((_, i) => i !== index);
    this.cdr.detectChanges();
  }

  async saveProfile(): Promise<void> {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          full_name: this.fullName,
          phone: this.phone,
          saved_addresses: this.savedAddresses
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось сохранить профиль');
      }

      this.errorMessage = '';
      this.showSuccess('Профиль сохранён');
      await this.loadProfile();
    } catch (error) {
      this.successMessage = '';
      this.errorMessage =
        error instanceof Error ? error.message : 'Не удалось сохранить профиль.';
      this.cdr.detectChanges();
    }
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

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'status-pending',
      accepted: 'status-accepted',
      out_of_stock: 'status-out',
      ready: 'status-ready',
      completed: 'status-completed'
    };

    return map[status] || 'status-pending';
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString('ru-RU');
  }

  openCart(): void {
    this.router.navigate(['/cart']);
  }

  goBack(): void {
    this.router.navigate([this.role === 'producer' ? '/producer/branches' : '/branches']);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;

    if (this.successTimer) {
      window.clearTimeout(this.successTimer);
    }

    this.successTimer = window.setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 2200);
  }
}