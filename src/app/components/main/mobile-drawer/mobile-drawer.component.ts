import { Component, DestroyRef, effect, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { MOBILE_MAX_WIDTH, MobileNavService } from 'src/app/services/shared/mobile-nav.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { isLinkActive, linksFor, NavLink } from '../main-nav.config';

// Cuánto (px) hay que arrastrar para que el gesto cuente, y cuánto para que al soltar se cierre.
const SWIPE_START_PX = 12;
const SWIPE_CLOSE_PX = 70;

// Cajón de navegación para móvil: agrupa todo lo que en escritorio vive en el header (monitor, mensajes,
// favoritos, perfil, búsqueda, salir) más los enlaces de menú y submenú.
@Component({
  standalone: false,
  selector: 'app-mobile-drawer',
  templateUrl: './mobile-drawer.component.html',
  styleUrls: ['./mobile-drawer.component.scss'],
})
export class MobileDrawerComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('closeBtn') closeBtn?: ElementRef<HTMLButtonElement>;

  public currentUser: JwtUserModel = { usuario: undefined, token: '' };
  public formGroup: FormGroup;
  // Desplazamiento (px) del cajón mientras se arrastra para cerrarlo.
  public readonly dragX = signal(0);

  private touchStart?: { x: number; y: number };
  private swiping = false;

  constructor(
    public nav: MobileNavService,
    private securityService: IHttpSecurityService,
    private signalrService: SignalrService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.formGroup = this.formBuilder.group({ search: '' });

    this.securityService
      .getCurrentUserAsObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: JwtUserModel) => (this.currentUser = value));

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.nav.close());

    // Foco y scroll: al abrir se bloquea el scroll de la página y el foco va al botón cerrar;
    // al cerrar se devuelve al botón hamburguesa.
    let wasOpen = false;
    effect(() => {
      const open = this.nav.isOpen();

      document.body.style.overflow = open ? 'hidden' : '';

      if (open) {
        setTimeout(() => this.closeBtn?.nativeElement.focus());
      } else if (wasOpen) {
        document.getElementById('mobile-nav-toggle')?.focus();
      }

      wasOpen = open;
    });

    this.destroyRef.onDestroy(() => (document.body.style.overflow = ''));
  }

  ngOnInit(): void {
    // Si se agranda la ventana (rotar a horizontal, tablet) el cajón ya no aplica: se cierra.
    const mql = window.matchMedia(`(min-width: ${MOBILE_MAX_WIDTH + 0.02}px)`);
    const onChange = (e: MediaQueryListEvent) => e.matches && this.nav.close();

    mql.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => mql.removeEventListener('change', onChange));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.nav.isOpen()) {
      this.nav.close();
    }
  }

  get rango(): string | undefined {
    return this.currentUser?.usuario?.rango;
  }

  get links(): NavLink[] {
    return linksFor(this.rango);
  }

  isActive(link: NavLink): boolean {
    return isLinkActive(this.router, link);
  }

  // Gesto: deslizar el cajón hacia la derecha lo cierra. Sigue al dedo y, al soltar, cierra si pasó el umbral.
  onTouchStart(event: TouchEvent): void {
    const t = event.touches[0];

    this.touchStart = { x: t.clientX, y: t.clientY };
    this.swiping = false;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.touchStart) {
      return;
    }

    const t = event.touches[0];
    const dx = t.clientX - this.touchStart.x;
    const dy = t.clientY - this.touchStart.y;

    // Solo un gesto claramente horizontal hacia la derecha; el resto es scroll vertical normal.
    if (!this.swiping && (dx <= SWIPE_START_PX || Math.abs(dx) < Math.abs(dy))) {
      return;
    }

    this.swiping = true;
    this.dragX.set(Math.max(0, dx));
  }

  onTouchEnd(): void {
    const dragged = this.dragX();

    this.touchStart = undefined;
    this.swiping = false;
    this.dragX.set(0);

    if (dragged > SWIPE_CLOSE_PX) {
      this.nav.close();
    }
  }

  buscar(): void {
    const q = (this.formGroup.value?.search ?? '').trim();

    if (!q) {
      return;
    }

    this.nav.close();
    this.router.navigate(['/buscar', 'posts', q]);
  }

  cerrarSesion(): void {
    this.signalrService.stop();
    this.securityService.logout();
    window.location.href = '';
  }
}
