import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private getKey() {
    const user = localStorage.getItem('username') || 'guest';
    return `orders_${user}`;
  }

  getOrders() {
    const data = localStorage.getItem(this.getKey());
    return data ? JSON.parse(data) : [];
  }

  addOrder(order: any) {
    const orders = this.getOrders();
    
    const newOrder = {
      ...order,
      id: Date.now(), 
      date: new Date().toLocaleString(), 
      done: false 
    };

    orders.unshift(newOrder); 
    localStorage.setItem(this.getKey(), JSON.stringify(orders));
  }

  markDone(index: number) {
    const orders = this.getOrders();
    if (orders[index]) {
      orders[index].done = true;
      orders[index].receivedAt = new Date().toLocaleString();
      localStorage.setItem(this.getKey(), JSON.stringify(orders));
    }
  }

  deleteOrder(index: number) {
    const orders = this.getOrders();
    orders.splice(index, 1);
    localStorage.setItem(this.getKey(), JSON.stringify(orders));
  }
}