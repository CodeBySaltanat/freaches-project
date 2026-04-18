import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ApiService } from '../../services/api';
import { CartService } from '../../services/cart'; 
import { OrderService } from '../../services/order';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent implements OnInit {
  isLoggedIn = false; 
  cart: any[] = [];
  address: string = ''; 
  comment: string = '';

  constructor(
    private cartService: CartService,
    private api: ApiService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    if (this.isLoggedIn) {
      this.cart = this.cartService.getItems();
    }
  }

  placeOrder() {
    if (!this.address) {
      alert('Введите адрес! 🏠');
      return;
    }

    if (this.cart.length === 0) {
      alert('Корзина пуста 🥪');
      return;
    }

    const total = this.cart.reduce((sum, i) => sum + i.price, 0);
    const localOrder = {
      items: [...this.cart], 
      total: total,
      address: this.address,
      createdAt: new Date().toLocaleString(),
      done: false
    };

    const orderData = {
      items: this.cart.map(item => ({ product: item.id, quantity: 1 }))
    };

    this.api.createOrder(orderData).subscribe({
      next: () => {
        this.orderService.addOrder(localOrder);
        this.finishOrder();
      },
      error: (err) => {
        console.error('Backend error, saving locally:', err);
        this.orderService.addOrder(localOrder); 
        
        alert('Заказ сохранен локально (сервер временно недоступен) 📡');
        this.finishOrder();
      }
    });
  }

  finishOrder() {
    this.cartService.clearCart();
    this.cart = [];
    this.address = '';
    this.router.navigate(['/orders']);
  }

  removeItem(index: number) {
    this.cartService.removeItem(index);
    this.cart = this.cartService.getItems();
  }

  getTotalPrice() {
    return this.cart.reduce((sum, item) => sum + item.price, 0);
  }
}
