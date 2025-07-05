import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  EMPTY,
  Observable,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((errorResponse: any) => {
      const isUnauthorized = errorResponse.status === 401;
      const shouldRefresh = ['Token missing', 'Token expired'].includes(
        errorResponse.error.message,
      );

      if (isUnauthorized && shouldRefresh) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            return next(req);
          }),
          catchError(() => {
            return authService.logout().pipe(
              tap(() => {
                localStorage.clear();
                router.navigate(['auth', 'login']);
              }),
              switchMap(() => {
                return EMPTY;
              }),
            );
          }),
        );
      }

      return throwError(() => errorResponse);
    }),
  );
};
