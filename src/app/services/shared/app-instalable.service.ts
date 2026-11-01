import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from 'src/environments/environment';
import { enNavegador } from 'src/app/shared/helpers/plataforma';

/** Lo que Chrome/Edge/Samsung pasan en `beforeinstallprompt` (no está en los tipos de TypeScript). */
interface EventoInstalar extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Cada cuánto se busca una versión nueva mientras la app está abierta y visible. */
const REVISAR_CADA_MS = 15 * 60_000;

/** Nombre del bundle principal en un HTML (`main-HASH.js`): cambia en cada deploy. */
export function bundlePrincipal(html: string): string | null {
  return /<script[^>]+src="\/?(main-[A-Za-z0-9]+\.js)"/.exec(html)?.[1] ?? null;
}

/**
 * La app instalable (PWA): registra el service worker (sw.js, que no cachea), guarda el aviso de instalación de
 * Android/Chrome para ofrecerlo desde el menú, y detecta deploys nuevos para que la app instalada no quede vieja:
 * si cambió el bundle, avisa y la próxima navegación carga la versión nueva.
 */
@Injectable({ providedIn: 'root' })
export class AppInstalableService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private aviso: EventoInstalar | null = null;
  /** Chrome/Edge/Samsung ofrecieron instalarla (se puede abrir su diálogo). */
  readonly puedeInstalar = signal(false);
  /** Abierta como app (desde el ícono de inicio), no en una pestaña del navegador. */
  readonly instalada = signal(false);
  /** iPhone/iPad en Safari: no hay diálogo, se instala con Compartir → "Agregar a inicio". */
  readonly esIos = signal(false);
  /** Hay un deploy más nuevo que el que está corriendo. */
  readonly versionNueva = signal(false);

  iniciar(): void {
    if (!enNavegador()) return;

    this.instalada.set(window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true);
    this.esIos.set(/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); // sin el mini-banner del navegador: se ofrece desde el menú
      this.aviso = e as EventoInstalar;
      this.puedeInstalar.set(true);
    });
    window.addEventListener('appinstalled', () => {
      this.aviso = null;
      this.puedeInstalar.set(false);
    });

    if (!environment.production) return; // en desarrollo los bundles no llevan hash y el SW estorba al recargar

    if ('serviceWorker' in navigator) {
      // Después de la carga: no compite con lo que ve el usuario al entrar.
      window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined), { once: true });
    }

    this.vigilarVersion();
  }

  /** Abre el diálogo de instalación del navegador. Devuelve si la instaló. */
  async instalar(): Promise<boolean> {
    if (!this.aviso) return false;
    await this.aviso.prompt();
    const { outcome } = await this.aviso.userChoice;
    this.aviso = null;
    this.puedeInstalar.set(false);
    return outcome === 'accepted';
  }

  recargar(): void {
    window.location.reload();
  }

  /**
   * Compara el bundle de esta página con el del index.html publicado: al volver a la app (estaba en segundo plano) y
   * cada 15 minutos con la pantalla visible. index.html se sirve sin caché, así que la consulta siempre ve el último deploy.
   */
  private vigilarVersion(): void {
    const actual = [...document.scripts].map((s) => /\/?(main-[A-Za-z0-9]+\.js)$/.exec(s.src)?.[1]).find(Boolean) ?? null;
    if (!actual) return;

    const revisar = async () => {
      if (this.versionNueva() || document.visibilityState !== 'visible') return;
      try {
        const html = await (await fetch('/index.html', { cache: 'no-store' })).text();
        const publicado = bundlePrincipal(html);
        if (publicado && publicado !== actual) this.versionNueva.set(true);
      } catch {
        // Sin conexión: se vuelve a intentar en la próxima.
      }
    };
    document.addEventListener('visibilitychange', revisar);
    const intervalo = setInterval(revisar, REVISAR_CADA_MS);
    this.destroyRef.onDestroy(() => {
      document.removeEventListener('visibilitychange', revisar);
      clearInterval(intervalo);
    });

    // Con un deploy nuevo, la próxima navegación entra entera (carga la versión nueva sin interrumpir lo que se hace).
    this.router.events
      .pipe(filter((e): e is NavigationStart => e instanceof NavigationStart && this.versionNueva()))
      .subscribe((e) => window.location.assign(e.url));
  }
}
