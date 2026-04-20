import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageKey = 'cart';

  getItems(): any[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  addItem(item: any): void {
    const items = this.getItems();
    items.push(item);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  removeItem(index: number): void {
    const items = this.getItems();
    items.splice(index, 1);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  clearCart(): void {
    localStorage.removeItem(this.storageKey);
  }
}