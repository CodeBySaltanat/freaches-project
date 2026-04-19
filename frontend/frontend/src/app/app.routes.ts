import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { MenuComponent } from './pages/menu/menu';
import { CartComponent } from './pages/cart/cart';
import { OrdersComponent } from './pages/orders/orders';
import { ProfileComponent } from './pages/profile/profile'; // Новый импорт
import { authGuard } from './guards/auth.guard';
import { BranchesComponent } from './pages/branches/branches';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  { path: 'branches', component: BranchesComponent, canActivate: [authGuard] },
  { path: 'menu/:id', component: MenuComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
];