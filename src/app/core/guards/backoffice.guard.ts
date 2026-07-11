import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';

export const backofficeGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.hasRole('Admin', 'Employee')) {
    return true;
  }

  if (auth.hasRole('Client')) {
    return router.createUrlTree(['/cliente']);
  }

  return router.createUrlTree(['/login']);
};
