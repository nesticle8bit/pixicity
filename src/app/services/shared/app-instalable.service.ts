import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { NavigationError, NavigationStart, Router } from '@angular/router';
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

/** Al volver de segundo plano después de este tiempo, un deploy nuevo se carga solo (sin aviso). */
const RECARGA_SOLA_TRAS_MS = 2 * 60_000;
const CLAVE_RECARGA_CHUNK = 'recarga-chunk';

/** Error de cargar un chunk lazy que ya no existe (Chrome, Firefox y Safari lo dicen distinto). */
export function esChunkViejo(error: unknown): boolean {
  const texto = String((error as { message?: string })?.message ?? error ?? '');
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported|ChunkLoadError|Loading chunk [\w-]+ failed/i.test(texto);
}

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
      window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => undefined), { once: true });
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

    // Desde cuándo está en segundo plano: en el celular la app instalada queda viva días con el JS de entonces.
    let ocultaDesde = document.visibilityState === 'hidden' ? Date.now() : 0;

    const revisar = async () => {
      if (document.visibilityState !== 'visible') {
        ocultaDesde ||= Date.now();
        return;
      }
      const volvioDeFondo = ocultaDesde > 0 && Date.now() - ocultaDesde >= RECARGA_SOLA_TRAS_MS;
      ocultaDesde = 0;
      if (this.versionNueva()) {
        if (volvioDeFondo) this.recargar();
        return;
      }
      try {
        const html = await (await fetch('/index.html', { cache: 'no-store' })).text();
        const publicado = bundlePrincipal(html);
        if (!publicado || publicado === actual) return;
        this.versionNueva.set(true);
        // Volvió a la app después de un rato: todavía no tocó nada, así que se actualiza sola sin perder nada.
        // Si estaba usándola, queda el aviso y la próxima navegación carga la versión nueva.
        if (volvioDeFondo && !this.escribiendo()) this.recargar();
      } catch {
        // Sin conexión: se vuelve a intentar en la próxima.
      }
    };
    document.addEventListener('visibilitychange', revisar);
    window.addEventListener('online', revisar);
    const intervalo = setInterval(revisar, REVISAR_CADA_MS);
    this.destroyRef.onDestroy(() => {
      document.removeEventListener('visibilitychange', revisar);
      window.removeEventListener('online', revisar);
      clearInterval(intervalo);
    });

    // Con un deploy nuevo, la próxima navegación entra entera (carga la versión nueva sin interrumpir lo que se hace).
    this.router.events
      .pipe(filter((e): e is NavigationStart => e instanceof NavigationStart && this.versionNueva()))
      .subscribe((e) => window.location.assign(e.url));

    // Si igual se adelantó al chequeo: la ruta (o un diálogo) pide un chunk que el deploy borró y la navegación
    // fallaba en silencio (la app "quedaba rota" hasta reinstalarla). Se entra entera a esa misma ruta.
    this.router.events
      .pipe(filter((e): e is NavigationError => e instanceof NavigationError && esChunkViejo(e.error)))
      .subscribe((e) => this.recargarPorChunk(e.url));
    window.addEventListener('unhandledrejection', (e) => {
      if (esChunkViejo(e.reason)) this.recargarPorChunk();
    });
  }

  /** Hay un campo con texto en foco (comentario, shout a medio escribir): no se recarga solo. */
  private escribiendo(): boolean {
    const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement | HTMLElement | null;
    if (!el) return false;
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) return !!el.value;
    return el.isContentEditable && !!el.textContent?.trim();
  }

  /** Una sola vez por minuto: si el chunk de verdad no existe (no es un deploy), no queda recargando en bucle. */
  private recargarPorChunk(url?: string): void {
    try {
      const ultima = Number(sessionStorage.getItem(CLAVE_RECARGA_CHUNK) ?? 0);
      if (Date.now() - ultima < 60_000) return;
      sessionStorage.setItem(CLAVE_RECARGA_CHUNK, String(Date.now()));
    } catch {
      // Sin sessionStorage (modo privado estricto): se recarga igual, una vez.
    }
    if (url) window.location.assign(url);
    else window.location.reload();
  }
}
