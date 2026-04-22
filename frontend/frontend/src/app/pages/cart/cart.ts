import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CartService, CartItem } from '../../services/cart';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {
  cart: CartItem[] = [];
  address = '';
  comment = '';
  loading = false;
  errorMessage = '';

  constructor(
    private cartService: CartService,
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('role') !== 'buyer') {
      this.router.navigate(['/orders']);
      return;
    }

    this.refreshCart();
  }

  refreshCart(): void {
    this.cart = this.cartService.getItems();
    this.cdr.detectChanges();
  }

  increaseQty(productId: number): void {
    this.cartService.increaseItem(productId);
    this.refreshCart();
  }

  decreaseQty(productId: number): void {
    this.cartService.decreaseItem(productId);
    this.refreshCart();
  }

  removeItem(productId: number): void {
    this.cartService.removeItem(productId);
    this.refreshCart();
  }

  getItemSubtotal(item: CartItem): number {
    return Number(item.price || 0) * Number(item.quantity || 0);
  }

  getTotalCount(): number {
    return this.cartService.getTotalCount();
  }

  getTotalPrice(): number {
    return this.cartService.getTotalPrice();
  }

  async placeOrder(): Promise<void> {
    this.errorMessage = '';

    if (!this.address.trim()) {
      this.errorMessage = 'Введите адрес доставки.';
      this.cdr.detectChanges();
      return;
    }

    if (this.cart.length === 0) {
      this.errorMessage = 'Корзина пуста.';
      this.cdr.detectChanges();
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      this.errorMessage = 'Сессия истекла. Войди заново.';
      this.cdr.detectChanges();
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    const orderData = {
      address: this.address,
      comment: this.comment,
      items: this.cart.map(item => ({
        product: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const result = await firstValueFrom(this.api.post<any>('/orders/', orderData));

      this.cartService.clearCart();
      this.cart = [];
      this.address = '';
      this.comment = '';
      this.loading = false;
      this.errorMessage = '';
      this.cdr.detectChanges();

      alert(result?.message || 'Заказ успешно оформлен!');
      this.router.navigate(['/orders']);
    } catch (error: any) {
      if (error?.status === 401) {
        localStorage.clear();
        this.loading = false;
        this.errorMessage = 'Сессия истекла. Войди заново.';
        this.cdr.detectChanges();
        this.router.navigate(['/login']);
        return;
      }

      this.loading = false;
      this.errorMessage = error?.error?.error || error?.message || 'Не удалось оформить заказ.';
      this.cdr.detectChanges();
    }
  }
}