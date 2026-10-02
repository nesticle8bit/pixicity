import { Component, DestroyRef, HostBinding, HostListener, inject, NgZone, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { MobileNavService } from 'src/app/services/shared/mobile-nav.service';

// En móvil el header se esconde al bajar y reaparece al subir; no se esconde en los primeros px de la página.
const HIDE_AFTER_PX = 120;
// Ignora movimientos de scroll más chicos que esto (evita parpadeo por rebotes del dedo).
const SCROLL_THRESHOLD_PX = 8;

@Component({
  standalone: false,
  selector: 'main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  public currentUser: JwtUserModel = { usuario: undefined, token: '' };

  @HostBinding('class.header--hidden') hidden = false;

  private lastY = 0;
  private ticking = false;

  constructor(
    public nav: MobileNavService,
    private securityService: IHttpSecurityService
  ) {
    this.securityService
      .getCurrentUserAsObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: JwtUserModel) => (this.currentUser = value));
  }

  get totalNoLeidos(): number {
    const { notifications, messages } = this.nav.stats();

    return this.currentUser.usuario ? notifications + messages : 0;
  }

  ngOnInit(): void {
    this.nav.watchStats();

    // El scroll se escucha fuera de Angular para no disparar detección de cambios en cada evento;
    // solo se vuelve a entrar a la zona cuando el header realmente cambia de estado.
    this.zone.runOutsideAngular(() => {
      const onScroll = () => {
        if (this.ticking) {
          return;
        }

        this.ticking = true;
        requestAnimationFrame(() => {
          this.ticking = false;
          this.onScrollFrame(window.scrollY);
        });
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
    });
  }

  // Si el foco entra al header (teclado) debe verse, aunque esté escondido.
  @HostListener('focusin')
  onFocusIn(): void {
    this.setHidden(false);
  }

  onScrollFrame(y: number): void {
    const delta = y - this.lastY;

    if (Math.abs(delta) < SCROLL_THRESHOLD_PX) {
      return;
    }

    this.lastY = y;
    this.setHidden(delta > 0 && y > HIDE_AFTER_PX && !this.nav.isOpen());
  }

  private setHidden(value: boolean): void {
    if (this.hidden !== value) {
      this.zone.run(() => (this.hidden = value));
    }
  }
}
