import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { SesionActivaViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { ConfirmarService } from 'src/app/services/shared/confirmar.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { TimeAgoPipe } from 'src/app/shared/pipes/timeAgo.pipe';
import { CountryFlagComponent } from '../../../addons/country-flag/country-flag.component';

// Con actividad en los últimos minutos se muestra "Activa ahora" (el API anota el uso cada ~2 minutos).
const MINUTOS_ACTIVA = 5;

const ICONOS: Record<SesionActivaViewModel['tipo'], string> = {
  movil: 'smartphone',
  tablet: 'tablet_android',
  escritorio: 'computer',
};

/** /cuenta → Sesiones activas: en qué dispositivos está abierta la cuenta, desde dónde, y cerrarlas. */
@Component({
  selector: 'app-account-sesiones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, TimeAgoPipe, CountryFlagComponent],
  templateUrl: './account-sesiones.component.html',
  styleUrl: './account-sesiones.component.scss',
})
export class AccountSesionesComponent {
  private readonly securityService = inject(IHttpSecurityService);
  private readonly confirmarService = inject(ConfirmarService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  /** undefined = cargando. */
  readonly sesiones = signal<SesionActivaViewModel[] | undefined>(undefined);
  readonly error = signal('');
  readonly cerrando = signal<number | 'otras' | null>(null);
  readonly hayOtras = computed(() => (this.sesiones() ?? []).some((s) => !s.actual));

  private readonly paises = this.crearNombresPaises();

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.error.set('');
    this.securityService
      .getMisSesiones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (s) => this.sesiones.set(s),
        error: (e: unknown) => {
          this.sesiones.set([]);
          this.error.set(e instanceof Error ? e.message : 'No se pudieron cargar las sesiones');
        },
      });
  }

  icono(s: SesionActivaViewModel): string {
    return ICONOS[s.tipo] ?? 'devices';
  }

  activaAhora(s: SesionActivaViewModel): boolean {
    return s.actual || Date.now() - new Date(s.activo).getTime() < MINUTOS_ACTIVA * 60 * 1000;
  }

  lugar(s: SesionActivaViewModel): string {
    const pais = s.pais ? this.paises?.of(s.pais) ?? s.pais : null;
    return [s.ciudad, pais].filter(Boolean).join(', ');
  }

  async cerrar(s: SesionActivaViewModel): Promise<void> {
    const ok = await this.confirmarService.confirmar({
      titulo: 'Cerrar sesión',
      mensaje: `¿Cerrar la sesión de ${s.navegador} en ${s.sistema}? Ese dispositivo tendrá que volver a iniciar sesión.`,
      aceptar: 'Cerrar sesión',
      peligro: true,
    });
    if (!ok) return;

    this.cerrando.set(s.id);
    this.securityService
      .cerrarMiSesion(s.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cerrando.set(null);
          this.sesiones.update((lista) => lista?.filter((x) => x.id !== s.id));
          this.notificationService.success('Sesión cerrada', 'Seguridad');
        },
        error: (e: unknown) => {
          this.cerrando.set(null);
          this.notificationService.error(e instanceof Error ? e.message : 'No se pudo cerrar la sesión', 'Seguridad');
          this.cargar();
        },
      });
  }

  async cerrarOtras(): Promise<void> {
    const ok = await this.confirmarService.confirmar({
      titulo: 'Cerrar las demás sesiones',
      mensaje: 'Se cerrará tu cuenta en todos los otros dispositivos. Este seguirá conectado.',
      aceptar: 'Cerrar las demás',
      peligro: true,
    });
    if (!ok) return;

    this.cerrando.set('otras');
    this.securityService
      .cerrarOtrasSesiones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (n) => {
          this.cerrando.set(null);
          this.sesiones.update((lista) => lista?.filter((x) => x.actual));
          this.notificationService.success(n === 1 ? 'Se cerró 1 sesión' : `Se cerraron ${n} sesiones`, 'Seguridad');
        },
        error: (e: unknown) => {
          this.cerrando.set(null);
          this.notificationService.error(e instanceof Error ? e.message : 'No se pudieron cerrar las sesiones', 'Seguridad');
        },
      });
  }

  private crearNombresPaises(): Intl.DisplayNames | null {
    try {
      return new Intl.DisplayNames(['es'], { type: 'region' });
    } catch {
      return null;
    }
  }
}
