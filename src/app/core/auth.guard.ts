import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.loggedIn();

  console.log('Auth Guard called');
  console.log('Is logged in:', isLoggedIn);
  console.log('Token:', localStorage.getItem('token'));

  return isLoggedIn
    ? true
    : router.createUrlTree(['/login']);
};