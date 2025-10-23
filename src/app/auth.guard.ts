import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/sign-in']);
    return false;
  }

  const expectedRole = route.data['role'] as
    | 'student'
    | 'teacher'
    | 'super'
    | undefined;
  const userRole = authService.getRole();

  if (expectedRole && userRole !== expectedRole) {
    router.navigate(['/sign-in']);
    return false;
  }

  return true;
};