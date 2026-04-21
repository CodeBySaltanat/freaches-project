import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branches.html',
  styleUrls: ['./branches.css']
})
export class BranchesComponent implements OnInit {
  branches: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('role') !== 'buyer') {
      this.router.navigate(['/orders']);
      return;
    }

    this.loadBranches();
  }

  async loadBranches() {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/branches/');

      if (!response.ok) {
        throw new Error('Не удалось загрузить филиалы');
      }

      const data = await response.json();
      this.branches = Array.isArray(data) ? data : [];
      this.loading = false;
      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Не удалось загрузить филиалы.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getCartCount() {
    return this.cartService.getTotalCount();
  }

  openBranch(branch: any) {
    this.router.navigate(['/menu', branch.id]);
  }

  openCart() {
    this.router.navigate(['/cart']);
  }

  openFavorites() {
    this.router.navigate(['/favorites']);
  }

  openOrders() {
    this.router.navigate(['/orders']);
  }

  openProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}