import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { OrderService } from '../../services/order';
import { ApiService } from '../../services/api'; 

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './orders.html'
})
export class OrdersComponent implements OnInit {

  orders: any[] = [];

  constructor(
    private orderService: OrderService,
    private api: ApiService 
  ) {}

  ngOnInit() {
    this.orders = this.orderService.getOrders();
  }

  markDone(i: number) {
    this.orderService.markDone(i);
    this.orders = this.orderService.getOrders();
  }

  deleteOrder(index: number, orderId: number) {
    if (orderId) {
      this.api.deleteOrder(orderId).subscribe({
        next: () => {
          this.orderService.deleteOrder(index);
          this.orders = this.orderService.getOrders();
        },
        error: (err) => {
          this.orderService.deleteOrder(index);
          this.orders = this.orderService.getOrders();
        }
      });
    } else {
      this.orderService.deleteOrder(index);
      this.orders = this.orderService.getOrders();
    }
  }
}