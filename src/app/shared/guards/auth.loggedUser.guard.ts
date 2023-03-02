import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Injectable({ providedIn: 'root' })
export class AuthLoggedUserGuard implements CanActivate {
    constructor(
        private router: Router,
        private securityService: IHttpSecurityService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const currentUser = this.securityService.getCurrentUser();

        if (currentUser?.usuario) {
            this.router.navigate(['/']);
            return false;
        }

        return true;
    }
}
