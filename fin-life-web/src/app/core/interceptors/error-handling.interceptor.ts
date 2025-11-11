import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

import { CommonService } from '../services/common.service';

export const DISPLAY_TOAST_ON_ERROR = new HttpContextToken<boolean>(() => true);

export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  const toastrService = inject(ToastrService);
  const commonService = inject(CommonService);

  return next(req).pipe(
    catchError((errorResponse: any) => {
      commonService.setLoading(false);

      if (
        req.context.get(DISPLAY_TOAST_ON_ERROR) &&
        errorResponse.status !== 401
      ) {
        const errorMessage =
          errorResponse.error.message ||
          'Algo deu errado! Tente novamente mais tarde';

        toastrService.error(errorMessage, undefined, { progressBar: true });
      }

      return throwError(() => errorResponse);
    }),
  );
};
