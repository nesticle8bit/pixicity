import { MatTooltip } from '@angular/material/tooltip';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { isLinkActive, linksFor, NavLink } from '../main-nav.config';
import { NgClass } from '@angular/common';
import { StaffBadgesService } from 'src/app/services/shared/staff-badges.service';

@Component({
    selector: 'main-menu',
    templateUrl: './main-menu.component.html',
    styleUrls: ['./main-menu.component.scss'],
    imports: [MatTooltip, NgClass, RouterLink],
})
export class MainMenuComponent implements OnInit {
  private securityService = inject(IHttpSecurityService);
  private router = inject(Router);
  private staffBadges = inject(StaffBadgesService);

  private readonly destroyRef = inject(DestroyRef);

  public currentUser: JwtUserModel = { usuario: undefined, token: '' };

  constructor() {
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

  /** Lo pendiente de Moderación / Administración (0 si la pestaña no lleva globo). */
  pendientes(link: NavLink): number {
    return link.badge ? this.staffBadges[link.badge]() : 0;
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
