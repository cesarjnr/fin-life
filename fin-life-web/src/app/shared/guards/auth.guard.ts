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
  const loggedInUser = authService.getLoggedInUser();

  if (loggedInUser && route.routeConfig?.path === 'login') {
    const defaultPortfolio = loggedInUser.portfolios.find(
      (portfolio) => portfolio.default,
    );
    const portfoliosPath = router.parseUrl(
      `portfolios/${defaultPortfolio!.id}`,
    );

    return new RedirectCommand(portfoliosPath);
  } else if (!loggedInUser && route.routeConfig?.path !== 'login') {
    const loginPath = router.parseUrl('auth/login');

    return new RedirectCommand(loginPath);
  }

  return true;
};
