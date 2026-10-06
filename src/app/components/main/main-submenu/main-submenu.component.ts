import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  standalone: false,
  selector: 'main-submenu',
  templateUrl: './main-submenu.component.html',
  styleUrls: ['./main-submenu.component.scss'],
})
export class MainSubmenuComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public currentUser?: JwtUserModel;
  public display!: DisplayComponentModel;

  /** Sección activa: define qué items del submenú se muestran */
  public seccion: 'comunidades' | 'general' = 'general';

  constructor(
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    private router: Router
  ) {
    this.currentUser = this.securityService.getCurrentUser();

    // Reactivo: "Crear Post" / "Moderación" aparecen o desaparecen al iniciar o cerrar sesión.
    this.securityService
      .getCurrentUserAsObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => (this.currentUser = value));
  }

  ngOnInit(): void {
    this.displayService
      .getDisplay()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: DisplayComponentModel) => {
        this.display = value;
      });

    this.setSeccion(this.router.url);
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((e: NavigationEnd) => this.setSeccion(e.urlAfterRedirects));
  }

  private setSeccion(url: string): void {
    this.seccion = url.startsWith('/comunidades') ? 'comunidades' : 'general';
  }
}
