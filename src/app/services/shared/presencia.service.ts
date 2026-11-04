import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';
import { enNavegador } from 'src/app/shared/helpers/plataforma';

/**
 * Minutos desde la última actividad en los que alguien cuenta como "Online". Es el mismo valor por defecto que el API
 * (ConfiguracionCache.MinutosEnLineaPorDefecto); el conteo de la portada usa el de Configuración del admin.
 */
export const MINUTOS_EN_LINEA = 20;

/** Cada cuánto se avisa "sigo acá" con la página a la vista. */
const CADA_MS = 2 * 60_000;
/** Al navegar o volver a la pestaña, no más de un aviso por minuto. */
const MINIMO_ENTRE_AVISOS_MS = 60_000;

/**
 * Presencia en línea (usuario con sesión, o invitado por IP), en toda la app (antes solo la mandaba la portada: en /mi, un post, un
 * shout o la app instalada nadie avisaba y a los minutos se veía "Offline" aunque siguiera navegando).
 * Avisa al entrar, cada 2 min con la pestaña visible, al volver a la pestaña/app y al cambiar de página.
 */
@Injectable({ providedIn: 'root' })
export class PresenciaService {
  private readonly security = inject(IHttpSecurityService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private ultimo = 0;
  private iniciado = false;

  iniciar(): void {
    if (!enNavegador() || this.iniciado) return;
    this.iniciado = true;

    const intervalo = setInterval(() => this.avisar(true), CADA_MS);
    const alVolver = () => this.avisar();
    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('online', alVolver);
    this.destroyRef.onDestroy(() => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener('online', alVolver);
    });

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.avisar());

    // Al iniciar sesión (o al abrir la app ya logueado) cuenta enseguida.
    this.security
      .getCurrentUserAsObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((u) => {
        if (u?.usuario) this.avisar(true);
      });
  }

  /** `periodico`: el del intervalo (no se frena por el mínimo, ya va espaciado). */
  private avisar(periodico = false): void {
    // También sin sesión: el API cuenta a los invitados por IP ("Invitados online"), como hacía la portada.
    if (document.visibilityState !== 'visible') return;
    const ahora = Date.now();
    if (!periodico && ahora - this.ultimo < MINIMO_ENTRE_AVISOS_MS) return;
    this.ultimo = ahora;
    this.security.sessionOnlineUser().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ error: () => undefined });
  }
}
