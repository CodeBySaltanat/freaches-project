import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class MenuComponent implements OnInit {
  isLoggedIn = false;
  products: any[] = [];
  branchId!: number;

  constructor(
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;

    this.branchId = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getProductsByBranch(this.branchId).subscribe((data: any) => {
      this.products = data;
    });
  }

  addToCart(item: any) {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Сначала нужно войти в систему!');
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.addItem(item);
    alert(item.name + ' добавлен в корзину!');
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}