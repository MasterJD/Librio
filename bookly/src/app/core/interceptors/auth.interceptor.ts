import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let cloned = req;
  if (token) {
    cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthRequest =
        req.url.includes('/auth/login') || req.url.includes('/auth/register');
      if (err.status === 401 && !isAuthRequest) {
        localStorage.removeItem('bookly_token');
        localStorage.removeItem('bookly_user');
        authService['currentUser'].set(null);
        if (router.url !== '/auth/login') {
          router.navigate(['/auth/login']);
        }
      }
      throw err;
    }),
  );
};