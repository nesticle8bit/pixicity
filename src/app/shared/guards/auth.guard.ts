import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const securityService = inject(IHttpSecurityService);

  const currentUser = securityService.getCurrentUser();

  if (currentUser?.usuario && currentUser?.token) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
