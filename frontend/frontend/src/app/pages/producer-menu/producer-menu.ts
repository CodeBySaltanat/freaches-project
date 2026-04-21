import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-producer-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="hero">
        <div class="hero__text">
          <span class="badge">Режим производителя</span>
          <h1>Управление меню филиала</h1>
          <p>
            Добавляй категории, создавай товары, редактируй карточки и управляй наличием.
          </p>
        </div>

        <div class="hero__actions">
          <button class="ghost-btn" (click)="goBack()">Филиалы</button>
          <button class="ghost-btn" (click)="openOrders()">Заказы</button>
          <button class="dark-btn" (click)="logout()">Выйти</button>
        </div>
      </div>

      <div class="state error" *ngIf="errorMessage">{{ errorMessage }}</div>
      <div class="state success" *ngIf="successMessage">{{ successMessage }}</div>
      <div class="state" *ngIf="loading">Загружаю данные...</div>

      <div class="forms-grid" *ngIf="!loading">
        <section class="form-card">
          <h2>Добавить новую категорию</h2>

          <div class="field">
            <label>Название категории</label>
            <input [(ngModel)]="newCategoryName" placeholder="Например, Desserts" />
          </div>

          <button class="secondary-btn" (click)="createCategory()">Добавить категорию</button>
        </section>

        <section class="form-card">
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
              <option *ngFor="let category of categories; trackBy: trackByCategory" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="field">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="newProduct.is_available" />
              Товар в наличии
            </label>
          </div>

          <div class="field">
            <label>Ссылки на фото</label>
            <textarea
              [(ngModel)]="newProduct.imagesText"
              rows="5"
              placeholder="Каждую ссылку с новой строки"
            ></textarea>
          </div>

          <button class="primary-btn" (click)="createProduct()">Добавить товар</button>
        </section>
      </div>

      <div class="products" *ngIf="!loading">
        <article class="product-card" *ngFor="let product of products; trackBy: trackByProduct">
          <div class="preview" *ngIf="product.images?.length > 0; else emptyPreviewTpl">
            <img [src]="product.images[0].image_url" [alt]="product.name" />
          </div>

          <ng-template #emptyPreviewTpl>
            <div class="preview preview--empty">Нет фото</div>
          </ng-template>

          <ng-container *ngIf="editingId !== product.id; else editTpl">
            <div class="product-card__head">
              <div>
                <h3>{{ product.name }}</h3>
                <div class="stock-label" [class.out]="!product.is_available">
                  {{ product.is_available ? 'В наличии' : 'Нет в наличии' }}
                </div>
              </div>

              <div class="price">{{ product.price }} ₸</div>
            </div>

            <p class="product-description">{{ product.description }}</p>

            <div class="meta-row">
              <span class="meta-chip">{{ getCategoryName(product.category) }}</span>
              <span class="images-note" *ngIf="product.images?.length">Фото: {{ product.images.length }}</span>
            </div>

            <div class="actions">
              <button class="primary-btn" (click)="startEdit(product)">Изменить</button>
              <button class="danger-btn" (click)="deleteProduct(product.id)">Удалить</button>
            </div>
          </ng-container>

          <ng-template #editTpl>
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
                <option *ngFor="let category of categories; trackBy: trackByCategory" [value]="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="field">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="editProduct.is_available" />
                Товар в наличии
              </label>
            </div>

            <div class="field">
              <label>Ссылки на фото</label>
              <textarea [(ngModel)]="editProduct.imagesText" rows="5"></textarea>
            </div>

            <div class="actions">
              <button class="primary-btn" (click)="saveEdit(product.id)">Сохранить</button>
              <button class="ghost-btn local-ghost" (click)="cancelEdit()">Отмена</button>
            </div>
          </ng-template>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      padding: 40px;
      background:
        radial-gradient(circle at 10% 18%, rgba(255, 93, 162, 0.10), transparent 24%),
        radial-gradient(circle at 92% 80%, rgba(255, 167, 204, 0.12), transparent 22%),
        linear-gradient(180deg, #fff8fc 0%, #f9f7ff 100%);
      font-family: Inter, Arial, sans-serif;
      box-sizing: border-box;
      max-width: 1380px;
      margin: 0 auto;
    }

    .hero {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 24px;
      margin-bottom: 28px;
      flex-wrap: wrap;
    }

    .hero__text {
      max-width: 760px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 10px 16px;
      border-radius: 999px;
      background: rgba(255, 95, 162, 0.10);
      color: #d63384;
      font-weight: 800;
      font-size: 14px;
      border: 1px solid rgba(255, 95, 162, 0.18);
      box-shadow: 0 8px 18px rgba(214, 51, 132, 0.08);
    }

    h1 {
      margin: 14px 0 10px;
      font-size: 58px;
      line-height: 0.98;
      letter-spacing: -1.6px;
      color: #1f1630;
      font-weight: 900;
    }

    h2 {
      margin: 0 0 18px;
      font-size: 26px;
      color: #2c1f38;
      font-weight: 900;
    }

    h3 {
      margin: 0 0 8px;
      font-size: 24px;
      line-height: 1.2;
      color: #2c1f38;
      font-weight: 900;
    }

    p {
      margin: 0;
      color: #6e5c7b;
      line-height: 1.65;
    }

    .hero__actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .ghost-btn,
    .dark-btn,
    .primary-btn,
    .secondary-btn,
    .danger-btn {
      border: none;
      border-radius: 16px;
      padding: 13px 16px;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
      font-family: inherit;
    }

    .ghost-btn {
      background: rgba(255, 255, 255, 0.90);
      color: #4a3757;
      border: 1px solid #f0d9e7;
      box-shadow: 0 10px 22px rgba(80, 40, 70, 0.05);
    }

    .dark-btn {
      background: #2a2233;
      color: white;
    }

    .primary-btn {
      background: linear-gradient(135deg, #ff5fa2, #ff8cc6);
      color: white;
      box-shadow: 0 14px 26px rgba(255, 95, 162, 0.24);
    }

    .secondary-btn {
      background: linear-gradient(135deg, #f06292, #ff9fc9);
      color: white;
      box-shadow: 0 14px 26px rgba(240, 98, 146, 0.22);
    }

    .danger-btn {
      background: #fff1f0;
      color: #b42318;
      border: 1px solid #ffd7d2;
    }

    .ghost-btn:hover,
    .dark-btn:hover,
    .primary-btn:hover,
    .secondary-btn:hover,
    .danger-btn:hover {
      transform: translateY(-1px);
    }

    .state,
    .form-card,
    .product-card {
      background: rgba(255, 255, 255, 0.97);
      border: 1px solid #f0e4ee;
      border-radius: 26px;
      box-shadow:
        0 18px 36px rgba(80, 40, 70, 0.06),
        0 6px 16px rgba(80, 40, 70, 0.03);
    }

    .state {
      padding: 18px 20px;
      margin-bottom: 20px;
      font-weight: 700;
      color: #5b4c67;
    }

    .state.error {
      color: #b42318;
      background: #fff1f0;
      border-color: #ffd7d2;
    }

    .state.success {
      color: #027a48;
      background: #ecfdf3;
      border-color: #c7f0d7;
    }

    .forms-grid {
      display: grid;
      grid-template-columns: 0.8fr 1.2fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-card {
      padding: 22px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 14px;
    }

    .field label {
      font-size: 14px;
      font-weight: 800;
      color: #3e2d4b;
    }

    .field input,
    .field select,
    .field textarea {
      padding: 13px 14px;
      border: 1px solid #f1d4e3;
      background: #fffafe;
      border-radius: 14px;
      font-size: 15px;
      font-family: inherit;
      color: #291d33;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    .field input:focus,
    .field select:focus,
    .field textarea:focus {
      border-color: #ff8cc6;
      box-shadow: 0 0 0 4px rgba(255, 95, 162, 0.12);
      background: white;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      cursor: pointer;
    }

    .products {
      display: grid;
      gap: 18px;
    }

    .product-card {
      padding: 20px;
    }

    .preview {
      margin-bottom: 14px;
      width: 100%;
      max-width: 340px;
      height: 210px;
      border-radius: 18px;
      overflow: hidden;
      border: 1px solid #f2dce8;
      background: linear-gradient(135deg, #fff0f7, #ffffff);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9b7891;
      font-weight: 800;
    }

    .preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .preview--empty {
      padding: 20px;
    }

    .product-card__head {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: start;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .stock-label {
      display: inline-flex;
      align-items: center;
      padding: 7px 11px;
      border-radius: 999px;
      background: #ecfdf3;
      color: #027a48;
      border: 1px solid #c7f0d7;
      font-size: 12px;
      font-weight: 800;
    }

    .stock-label.out {
      background: #eef2f7;
      color: #556173;
      border: 1px solid #d8e1eb;
    }

    .product-description {
      color: #766583;
      margin-bottom: 14px;
    }

    .price {
      font-size: 24px;
      font-weight: 900;
      color: #2c1f38;
      white-space: nowrap;
    }

    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      margin-bottom: 14px;
    }

    .meta-chip,
    .images-note {
      display: inline-flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
    }

    .meta-chip {
      background: rgba(255, 95, 162, 0.10);
      color: #d63384;
      border: 1px solid rgba(255, 95, 162, 0.14);
    }

    .images-note {
      background: #fff7fb;
      color: #8b5271;
      border: 1px solid #f2d6e4;
    }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
    }

    .local-ghost {
      background: rgba(255, 255, 255, 0.90);
    }

    @media (max-width: 980px) {
      .page {
        padding: 24px 18px;
      }

      .hero {
        flex-direction: column;
        align-items: start;
      }

      h1 {
        font-size: 42px;
        line-height: 1;
        letter-spacing: -1px;
      }

      .hero__actions {
        width: 100%;
      }

      .hero__actions button {
        flex: 1 1 auto;
      }

      .forms-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProducerMenuComponent implements OnInit, OnDestroy {
  branchId = 0;
  loading = true;
  errorMessage = '';
  successMessage = '';

  products: any[] = [];
  categories: any[] = [];

  newCategoryName = '';

  newProduct = {
    name: '',
    price: '',
    description: '',
    category: '',
    imagesText: '',
    is_available: true
  };

  editingId: number | null = null;
  editProduct: any = {
    name: '',
    price: '',
    description: '',
    category: '',
    imagesText: '',
    is_available: true
  };

  private successTimer?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('role') !== 'producer') {
      this.router.navigate(['/branches']);
      return;
    }

    this.branchId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.branchId) {
      this.loading = false;
      this.errorMessage = 'Филиал не найден.';
      this.cdr.detectChanges();
      return;
    }

    this.loadAll();
  }

  ngOnDestroy(): void {
    if (this.successTimer) {
      window.clearTimeout(this.successTimer);
    }
  }

  trackByProduct = (_: number, product: any) => product.id;
  trackByCategory = (_: number, category: any) => category.id;

  parseImageUrls(text: string): string[] {
    return text
      .split('\n')
      .map(url => url.trim())
      .filter(url => !!url);
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((item: any) => Number(item.id) === Number(categoryId));
    return category ? category.name : 'Без категории';
  }

  async loadAll(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const token = localStorage.getItem('token');

      const [categoriesResponse, productsResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/categories/'),
        fetch('http://127.0.0.1:8000/api/manage-products/?branch=' + this.branchId, {
          headers: {
            Authorization: 'Bearer ' + token
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

  async createCategory(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newCategoryName.trim()) {
      this.errorMessage = 'Введите название категории.';
      this.cdr.detectChanges();
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/manage-categories/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          name: this.newCategoryName.trim()
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось добавить категорию');
      }

      this.newCategoryName = '';
      await this.loadAll();

      if (result.id) {
        this.newProduct.category = String(result.id);
        if (this.editingId !== null) {
          this.editProduct.category = result.id;
        }
      }

      this.showSuccess('Категория успешно добавлена.');
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Не удалось добавить категорию.';
      this.cdr.detectChanges();
    }
  }

  async createProduct(): Promise<void> {
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
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          name: this.newProduct.name,
          price: Number(this.newProduct.price),
          description: this.newProduct.description,
          category: Number(this.newProduct.category),
          branch: this.branchId,
          image_urls: this.parseImageUrls(this.newProduct.imagesText),
          is_available: !!this.newProduct.is_available
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось добавить товар');
      }

      this.newProduct = {
        name: '',
        price: '',
        description: '',
        category: '',
        imagesText: '',
        is_available: true
      };

      await this.loadAll();
      this.showSuccess('Товар успешно добавлен.');
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Не удалось добавить товар.';
      this.cdr.detectChanges();
    }
  }

  startEdit(product: any): void {
    this.editingId = product.id;
    this.editProduct = {
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      imagesText: (product.images || []).map((img: any) => img.image_url).join('\n'),
      is_available: product.is_available
    };
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editProduct = {
      name: '',
      price: '',
      description: '',
      category: '',
      imagesText: '',
      is_available: true
    };
    this.cdr.detectChanges();
  }

  async saveEdit(productId: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/manage-products/' + productId + '/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          name: this.editProduct.name,
          price: Number(this.editProduct.price),
          description: this.editProduct.description,
          category: Number(this.editProduct.category),
          branch: this.branchId,
          image_urls: this.parseImageUrls(this.editProduct.imagesText),
          is_available: !!this.editProduct.is_available
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось обновить товар');
      }

      this.cancelEdit();
      await this.loadAll();
      this.showSuccess('Товар успешно обновлён.');
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Не удалось обновить товар.';
      this.cdr.detectChanges();
    }
  }

  async deleteProduct(productId: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/manage-products/' + productId + '/', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + token
        }
      });

      if (!response.ok) {
        throw new Error('Не удалось удалить товар');
      }

      await this.loadAll();
      this.showSuccess('Товар удалён.');
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Не удалось удалить товар.';
      this.cdr.detectChanges();
    }
  }

  goBack(): void {
    this.router.navigate(['/producer/branches']);
  }

  openOrders(): void {
    this.router.navigate(['/orders']);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';

    if (this.successTimer) {
      window.clearTimeout(this.successTimer);
    }

    this.successTimer = window.setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 2200);
  }
}