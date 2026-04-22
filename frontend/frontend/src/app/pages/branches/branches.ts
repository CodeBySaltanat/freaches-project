import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CartService } from '../../services/cart';
import { ApiService } from '../../services/api';

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
    private cdr: ChangeDetectorRef,
    private api: ApiService
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
      const data = await firstValueFrom(this.api.get<any[]>('/branches/'));
      this.branches = Array.isArray(data) ? data : [];
      this.loading = false;
      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (error: any) {
      this.errorMessage = error?.error?.error || 'Не удалось загрузить филиалы.';
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