import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { BranchesComponent } from './pages/branches/branches';
import { MenuComponent } from './pages/menu/menu';
import { CartComponent } from './pages/cart/cart';
import { OrdersComponent } from './pages/orders/orders';
import { ProfileComponent } from './pages/profile/profile';
import { ProducerBranchesComponent } from './pages/producer-branches/producer-branches';
import { ProducerMenuComponent } from './pages/producer-menu/producer-menu';
import { FavoritesComponent } from './pages/favorites/favorites';
import { ProductDetailsComponent } from './pages/product-details/product-details';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  { path: 'branches', component: BranchesComponent, canActivate: [authGuard], data: { role: 'buyer' } },
  { path: 'menu/:id', component: MenuComponent, canActivate: [authGuard], data: { role: 'buyer' } },
  { path: 'product/:id', component: ProductDetailsComponent, canActivate: [authGuard], data: { role: 'buyer' } },
  { path: 'cart', component: CartComponent, canActivate: [authGuard], data: { role: 'buyer' } },
  { path: 'favorites', component: FavoritesComponent, canActivate: [authGuard], data: { role: 'buyer' } },

  { path: 'producer/branches', component: ProducerBranchesComponent, canActivate: [authGuard], data: { role: 'producer' } },
  { path: 'producer/menu/:id', component: ProducerMenuComponent, canActivate: [authGuard], data: { role: 'producer' } },

  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: 'login' }
];