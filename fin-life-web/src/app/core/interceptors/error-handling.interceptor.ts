import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const DISPLAY_TOAST_ON_ERROR = new HttpContextToken<boolean>(() => true);

export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  const toastrService = inject(ToastrService);

  return next(req).pipe(
    catchError((errorResponse: any) => {
      if (req.context.get(DISPLAY_TOAST_ON_ERROR)) {
        const errorMessage =
          errorResponse.error.message ||
          'Algo deu errado! Tente novamente mais tarde';

        toastrService.error(errorMessage, undefined, { progressBar: true });
      }

      return throwError(() => errorResponse);
    }),
  );
};
