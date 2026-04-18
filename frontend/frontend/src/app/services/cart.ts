import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private getKey() {
    const username = localStorage.getItem('username') || 'guest';
    return `cart_${username}`;
  }

  getItems() {
    const data = localStorage.getItem(this.getKey());
    return data ? JSON.parse(data) : [];
  }

  addItem(item: any) {
    const items = this.getItems();
    items.push(item);
    localStorage.setItem(this.getKey(), JSON.stringify(items));
  }

  removeItem(index: number) {
    const items = this.getItems();
    items.splice(index, 1);
    localStorage.setItem(this.getKey(), JSON.stringify(items));
  }

  clearCart() {
    localStorage.removeItem(this.getKey());
  }
}
