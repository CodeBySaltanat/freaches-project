import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-producer-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="topbar">
        <div>
          <h1>Управление меню филиала</h1>
          <p>Добавляй, редактируй и удаляй товары</p>
        </div>

        <div class="topbar-actions">
          <button (click)="goBack()">Филиалы</button>
          <button (click)="openOrders()">Заказы</button>
          <button class="ghost" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state error" *ngIf="errorMessage">{{ errorMessage }}</div>
      <div class="state success" *ngIf="successMessage">{{ successMessage }}</div>
      <div class="state" *ngIf="loading">Загружаю данные...</div>

      <div class="form-card" *ngIf="!loading">
        <h2>Добавить новый товар</h2>

        <div class="field">
          <label>Название</label>
          <input [(ngModel)]="newProduct.name" placeholder="Например, Chicken Wrap" />
        </div>

        <div class="field">
          <label>Цена</label>
          <input [(ngModel)]="newProduct.price" type="number" placeholder="Например, 1800" />
        </div>

        <div class="field">
          <label>Описание</label>
          <input [(ngModel)]="newProduct.description" placeholder="Короткое описание" />
        </div>

        <div class="field">
          <label>Категория</label>
          <select [(ngModel)]="newProduct.category">
            <option value="">Выбери категорию</option>
            <option *ngFor="let category of categories" [value]="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <button class="primary" (click)="createProduct()">Добавить товар</button>
      </div>

      <div class="products" *ngIf="!loading">
        <div class="product-card" *ngFor="let product of products">
          <div *ngIf="editingId !== product.id">
            <h3>{{ product.name }}</h3>
            <p>{{ product.description }}</p>
            <div class="price">{{ product.price }} ₸</div>

            <div class="actions">
              <button (click)="startEdit(product)">Изменить</button>
              <button class="danger" (click)="deleteProduct(product.id)">Удалить</button>
            </div>
          </div>

          <div *ngIf="editingId === product.id">
            <div class="field">
              <label>Название</label>
              <input [(ngModel)]="editProduct.name" />
            </div>

            <div class="field">
              <label>Цена</label>
              <input [(ngModel)]="editProduct.price" type="number" />
            </div>

            <div class="field">
              <label>Описание</label>
              <input [(ngModel)]="editProduct.description" />
            </div>

            <div class="field">
              <label>Категория</label>
              <select [(ngModel)]="editProduct.category">
                <option *ngFor="let category of categories" [value]="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="actions">
              <button (click)="saveEdit(product.id)">Сохранить</button>
              <button class="ghost-btn" (click)="cancelEdit()">Отмена</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      padding: 32px;
      background: #f7f1ea;
      font-family: Arial, sans-serif;
      box-sizing: border-box;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 28px;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 36px;
    }

    h2 {
      margin: 0 0 18px;
      font-size: 24px;
    }

    p {
      margin: 0;
      color: #666;
    }

    .topbar-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .topbar-actions button,
    .primary,
    .actions button {
      border: none;
      border-radius: 12px;
      padding: 12px 16px;
      background: #ff8a3d;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .topbar-actions .ghost {
      background: #333;
    }

    .ghost-btn {
      background: #555 !important;
    }

    .danger {
      background: #c23b2f !important;
    }

    .state,
    .form-card,
    .product-card {
      background: white;
      border-radius: 18px;
      padding: 20px;
      margin-bottom: 18px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
    }

    .state.error {
      color: #b42318;
      background: #fff1f0;
    }

    .state.success {
      color: #027a48;
      background: #ecfdf3;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 14px;
    }

    .field label {
      font-weight: 700;
    }

    .field input,
    .field select {
      padding: 12px 14px;
      border: 1px solid #d8d8d8;
      border-radius: 12px;
      font-size: 15px;
    }

    .products {
      display: grid;
      gap: 16px;
    }

    .product-card h3 {
      margin: 0 0 8px;
    }

    .price {
      font-size: 22px;
      font-weight: 800;
      margin: 16px 0;
    }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 12px;
    }
  `]
})
export class ProducerMenuComponent implements OnInit {
  branchId = 0;
  loading = true;
  errorMessage = '';
  successMessage = '';

  products: any[] = [];
  categories: any[] = [];

  newProduct = {
    name: '',
    price: '',
    description: '',
    category: ''
  };

  editingId: number | null = null;
  editProduct: any = {
    name: '',
    price: '',
    description: '',
    category: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.branchId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAll();
  }

  async loadAll() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const token = localStorage.getItem('token');

      const [categoriesResponse, productsResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/categories/'),
        fetch('http://127.0.0.1:8000/api/manage-products/?branch=' + this.branchId, {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        })
      ]);

      if (!categoriesResponse.ok) {
        throw new Error('Не удалось загрузить категории');
      }

      if (!productsResponse.ok) {
        throw new Error('Не удалось загрузить товары филиала');
      }

      const categoriesData = await categoriesResponse.json();
      const productsData = await productsResponse.json();

      this.categories = Array.isArray(categoriesData) ? categoriesData : [];
      this.products = Array.isArray(productsData) ? productsData : [];
      this.loading = false;
      this.cdr.detectChanges();
    } catch (error) {
      this.loading = false;
      this.errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки';
      this.cdr.detectChanges();
    }
  }

  async createProduct() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newProduct.name.trim() || !this.newProduct.price || !this.newProduct.category) {
      this.errorMessage = 'Заполни название, цену и категорию.';
      this.cdr.detectChanges();
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/manage-products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          name: this.newProduct.name,
          price: Number(this.newProduct.price),
          description: this.newProduct.description,
          category: Number(this.newProduct.category),
          branch: this.branchId
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(JSON.stringify(result));
      }

      this.newProduct = {
        name: '',
        price: '',
        description: '',
        category: ''
      };

      this.successMessage = 'Товар успешно добавлен.';
      await this.loadAll();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось добавить товар.';
      this.cdr.detectChanges();
    }
  }

  startEdit(product: any) {
    this.editingId = product.id;
    this.editProduct = {
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category
    };
  }

  cancelEdit() {
    this.editingId = null;
    this.editProduct = {
      name: '',
      price: '',
      description: '',
      category: ''
    };
  }

  async saveEdit(productId: number) {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/manage-products/' + productId + '/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          name: this.editProduct.name,
          price: Number(this.editProduct.price),
          description: this.editProduct.description,
          category: Number(this.editProduct.category),
          branch: this.branchId
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(JSON.stringify(result));
      }

      this.successMessage = 'Товар успешно обновлён.';
      this.cancelEdit();
      await this.loadAll();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось обновить товар.';
      this.cdr.detectChanges();
    }
  }

  async deleteProduct(productId: number) {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/manage-products/' + productId + '/', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (!response.ok) {
        throw new Error('Не удалось удалить товар');
      }

      this.successMessage = 'Товар удалён.';
      await this.loadAll();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Не удалось удалить товар.';
      this.cdr.detectChanges();
    }
  }

  goBack() {
    this.router.navigate(['/producer/branches']);
  }

  openOrders() {
    this.router.navigate(['/orders']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}