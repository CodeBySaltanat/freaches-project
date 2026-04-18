import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router); // Наш "навигатор"
  const token = localStorage.getItem('token'); // Проверяем ключ

  if (token) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};