import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import {
  MAT_DATE_FNS_FORMATS,
  provideDateFnsAdapter,
} from '@angular/material-date-fns-adapter';
import { enUS } from 'date-fns/locale';
import { provideToastr } from 'ngx-toastr';
import { provideNgxMask } from 'ngx-mask';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorHandlingInterceptor } from './core/interceptors/error-handling.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorHandlingInterceptor]),
    ),
    provideAnimationsAsync(),
    provideDateFnsAdapter({
      parse: {
        dateInput: 'yyyy-MM-dd',
      },
      display: {
        dateInput: 'yyyy-MM-dd',
        monthYearLabel: 'MMM yyyy',
        dateA11yLabel: 'PPPP',
        monthYearA11yLabel: 'MMMM yyyy',
      },
    }),
    provideToastr({ positionClass: 'toast-bottom-center' }),
    provideNgxMask(),
    { provide: MAT_DATE_LOCALE, useValue: enUS },
    { provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FNS_FORMATS },
  ],
};
