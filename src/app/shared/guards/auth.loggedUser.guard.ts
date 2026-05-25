import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

export const AuthLoggedUserGuard: CanActivateFn = () => {
  const router = inject(Router);
  const securityService = inject(IHttpSecurityService);

  const currentUser = securityService.getCurrentUser();

  if (currentUser?.usuario) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
