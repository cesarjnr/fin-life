import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RedirectCommand,
  Router,
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const loggedUser = authService.getLoggedUser();

  if (loggedUser && route.routeConfig?.path === 'login') {
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    );
    const portfoliosPath = router.parseUrl(
      `portfolios/${defaultPortfolio!.id}`,
    );

    return new RedirectCommand(portfoliosPath);
  } else if (!loggedUser && route.routeConfig?.path !== 'login') {
    const loginPath = router.parseUrl('auth/login');

    return new RedirectCommand(loginPath);
  }

  return true;
};
