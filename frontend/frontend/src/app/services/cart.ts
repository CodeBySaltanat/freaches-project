import { Injectable } from '@angular/core';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  description: string;
  category: number;
  branch: number;
  quantity: number;
  images?: any[];
  avg_rating?: number;
  reviews_count?: number;
  is_available?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageKey = 'cart';

  private normalizeItems(rawItems: any[]): CartItem[] {
    if (!Array.isArray(rawItems)) return [];

    const map = new Map<number, CartItem>();

    for (const raw of rawItems) {
      const id = Number(raw?.id);
      if (!Number.isFinite(id)) continue;

      const quantityRaw = Number(raw?.quantity);
      const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 1;

      const priceRaw = Number(raw?.price);
      const price = Number.isFinite(priceRaw) ? priceRaw : 0;

      if (map.has(id)) {
        const existing = map.get(id)!;
        existing.quantity += quantity;
      } else {
        map.set(id, {
          id,
          name: String(raw?.name || ''),
          price,
          description: String(raw?.description || ''),
          category: Number(raw?.category || 0),
          branch: Number(raw?.branch || 0),
          quantity,
          images: Array.isArray(raw?.images) ? raw.images : [],
          avg_rating: Number(raw?.avg_rating || 0),
          reviews_count: Number(raw?.reviews_count || 0),
          is_available: raw?.is_available !== false
        });
      }
    }

    return Array.from(map.values());
  }

  private saveItems(items: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  getItems(): CartItem[] {
    const data = localStorage.getItem(this.storageKey);

    if (!data) return [];

    try {
      const parsed = JSON.parse(data);
      const normalized = this.normalizeItems(parsed);
      this.saveItems(normalized);
      return normalized;
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }

  addItem(product: any): void {
    const items = this.getItems();
    const existing = items.find(item => Number(item.id) === Number(product.id));

    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        id: Number(product.id),
        name: String(product.name || ''),
        price: Number(product.price || 0),
        description: String(product.description || ''),
        category: Number(product.category || 0),
        branch: Number(product.branch || 0),
        quantity: 1,
        images: Array.isArray(product.images) ? product.images : [],
        avg_rating: Number(product.avg_rating || 0),
        reviews_count: Number(product.reviews_count || 0),
        is_available: product.is_available !== false
      });
    }

    this.saveItems(items);
  }

  increaseItem(productId: number): void {
    const items = this.getItems();
    const existing = items.find(item => Number(item.id) === Number(productId));

    if (!existing) return;

    existing.quantity += 1;
    this.saveItems(items);
  }

  decreaseItem(productId: number): void {
    let items = this.getItems();
    const existing = items.find(item => Number(item.id) === Number(productId));

    if (!existing) return;

    if (existing.quantity > 1) {
      existing.quantity -= 1;
    } else {
      items = items.filter(item => Number(item.id) !== Number(productId));
    }

    this.saveItems(items);
  }

  removeItem(productId: number): void {
    const items = this.getItems().filter(item => Number(item.id) !== Number(productId));
    this.saveItems(items);
  }

  clearCart(): void {
    localStorage.removeItem(this.storageKey);
  }

  getItemCount(productId: number): number {
    const item = this.getItems().find(i => Number(i.id) === Number(productId));
    return item ? Number(item.quantity) : 0;
  }

  getTotalCount(): number {
    return this.getItems().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }

  getTotalPrice(): number {
    return this.getItems().reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);
  }
}