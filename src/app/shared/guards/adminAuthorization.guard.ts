import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { jwtDecode } from 'jwt-decode';

export const AdministradorAuthorization: CanActivateFn = () => {
  const router = inject(Router);
  const securityService = inject(IHttpSecurityService);

  const currentUser = securityService.getCurrentUser();

  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  const decoded = jwtDecode(currentUser.token) as any;

  if (!decoded || decoded.role !== 'Administrador') {
    router.navigate(['']);
    return false;
  }

  return true;
};
