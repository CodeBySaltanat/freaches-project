import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const requiredRole = route.data?.['role'];

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  if (requiredRole && role !== requiredRole) {
    router.navigate([role === 'producer' ? '/orders' : '/branches']);
    return false;
  }

  return true;
};