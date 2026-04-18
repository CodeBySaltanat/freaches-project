import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { MenuComponent } from './pages/menu/menu';
import { CartComponent } from './pages/cart/cart';
import { OrdersComponent } from './pages/orders/orders';
import { ProfileComponent } from './pages/profile/profile'; // Новый импорт
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  { path: 'menu', component: MenuComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] }, // Путь к профилю
];