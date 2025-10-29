import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/auth/token-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  let authRequest = req;
  const token = tokenService.getToken();

  if (token && !tokenService.isTokenExpired()) {
    authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        handleUnauthorized(tokenService, router);
      }
      return throwError(() => error);
    })
  );
};

function handleUnauthorized(tokenService: TokenService, router: Router): void {
  tokenService.clearStorage();
  router.navigate(['/login']);
}
