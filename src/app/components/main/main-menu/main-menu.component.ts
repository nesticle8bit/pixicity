import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { isLinkActive, linksFor, NavLink } from '../main-nav.config';

@Component({
  standalone: false,
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public currentUser: JwtUserModel = { usuario: undefined, token: '' };

  constructor(
    private securityService: IHttpSecurityService,
    private router: Router
  ) {
    // Reactivo: el menú se actualiza al iniciar o cerrar sesión sin depender de recargar la página.
    this.securityService
      .getCurrentUserAsObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: JwtUserModel) => (this.currentUser = value));
  }

  ngOnInit(): void {}

  get tabs(): NavLink[] {
    return linksFor(this.currentUser?.usuario?.rango, true);
  }

  isActive(link: NavLink): boolean {
    return isLinkActive(this.router, link);
  }

  isRouteActive(route: string): boolean {
    return this.router.isActive(route, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}
