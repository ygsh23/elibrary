import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      const isAuthenticated = !!user;
      
      if (isAuthenticated) {
        return true;
      }
      
      // Redirect to login page if not authenticated
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      const isAdmin = user?.role === 'ADMIN';
      
      if (isAdmin) {
        return true;
      }
      
      // Redirect to dashboard if not an admin
      router.navigate(['/dashboard']);
      return false;
    })
  );
};
