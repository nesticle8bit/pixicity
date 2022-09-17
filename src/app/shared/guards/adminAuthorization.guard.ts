import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import * as jwt_decode from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AdministradorAuthorization implements CanActivate {
  constructor(
    private router: Router,
    private securityService: IHttpSecurityService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const currentUser = this.securityService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
    }

    const decoded = jwt_decode.default(currentUser.token) as any;

    if (!decoded) {
      this.router.navigate(['']);
    }

    if (decoded.role !== 'Administrador') {
      this.router.navigate(['']);
    }

    return true;
  }
}
