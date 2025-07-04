import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const loggedInUser = authService.getLoggedInUser();

  if (!loggedInUser) {
    const loginPath = router.parseUrl('auth/login');

    return new RedirectCommand(loginPath);
  }

  return true;
};
