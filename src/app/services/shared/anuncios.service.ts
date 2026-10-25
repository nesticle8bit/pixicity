import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, shareReplay, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from 'src/app/models/api/api-response.model';
import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';
import { enNavegador } from 'src/app/shared/helpers/plataforma';
import {
  AnuncioPublico,
  anuncioAplica,
  ContextoAnuncio,
  elegirPorPeso,
  UbicacionAnuncio,
  Visitante,
} from 'src/app/components/ads/anuncios';

/** Lo que dura la lista en memoria (el API la cachea 2 min): una pestaña abierta mucho rato ve campañas nuevas. */
const VIGENCIA_MS = 5 * 60 * 1000;
/** Cada cuánto se mandan las métricas juntadas (y al ocultar o cerrar la página). */
const ENVIO_MS = 15 * 1000;
const MOVIL = '(max-width: 767.98px)';

/**
 * Anuncios del sitio: se piden todos juntos una vez (son pocos y la respuesta es igual para todos) y cada espacio
 * (app-anuncio) elige el suyo según la página, el dispositivo y la sesión. También junta las impresiones y los
 * clics y los manda en lote a /api/anuncios/metricas.
 */
@Injectable({ providedIn: 'root' })
export class AnunciosService {
  private http = inject(HttpClient);
  private securityService = inject(IHttpSecurityService);

  private lista$?: Observable<AnuncioPublico[]>;
  private ultimaLista: AnuncioPublico[] | null = null;
  private pedidaEn = 0;
  /** Anuncios ya puestos en la página actual: el siguiente espacio prefiere uno distinto. */
  private readonly mostrados = new Set<number>();
  private readonly pendientes = new Map<number, { impresiones: number; clics: number }>();
  private envio?: ReturnType<typeof setTimeout>;

  constructor() {
    if (!enNavegador()) return;

    inject(Router).events.pipe(filter((e) => e instanceof NavigationStart)).subscribe(() => this.mostrados.clear());
    // Al irse de la página: lo que quedaba sin mandar sale con keepalive, que sobrevive a la descarga.
    document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && this.enviar());
    window.addEventListener('pagehide', () => this.enviar());
  }

  /** Se llama al arrancar: así, cuando una página pinta su espacio, la lista ya está y el anuncio no la empuja. */
  precargar(): void {
    this.lista().subscribe();
  }

  /** El anuncio para un espacio, o null si no hay ninguno que aplique. */
  elegir(ubicacion: UbicacionAnuncio, contexto: ContextoAnuncio): Observable<AnuncioPublico | null> {
    return this.lista().pipe(
      map((lista) => {
        const candidatos = this.candidatos(lista, ubicacion, contexto);
        const nuevos = candidatos.filter((a) => !this.mostrados.has(a.id));
        const elegido = elegirPorPeso(nuevos.length ? nuevos : candidatos);
        if (elegido) this.mostrados.add(elegido.id);
        return elegido;
      }),
    );
  }

  /**
   * ¿Hay ya algún anuncio para este espacio? Sin esperar: con la lista que se tenga en este momento. La vista del
   * post lo usa para decidir si parte el contenido antes de pintarlo; partirlo después movería el texto.
   */
  hayYa(ubicacion: UbicacionAnuncio, contexto: ContextoAnuncio): boolean {
    return !!this.ultimaLista && this.candidatos(this.ultimaLista, ubicacion, contexto).length > 0;
  }

  registrar(anuncioId: number, evento: 'impresion' | 'clic'): void {
    if (!enNavegador()) return;
    const actual = this.pendientes.get(anuncioId) ?? { impresiones: 0, clics: 0 };
    if (evento === 'impresion') actual.impresiones++;
    else actual.clics++;
    this.pendientes.set(anuncioId, actual);
    this.envio ??= setTimeout(() => this.enviar(), ENVIO_MS);
  }

  private candidatos(lista: AnuncioPublico[], ubicacion: string, contexto: ContextoAnuncio): AnuncioPublico[] {
    const visitante: Visitante = {
      movil: window.matchMedia(MOVIL).matches,
      conSesion: !!this.securityService.getCurrentUser()?.token,
    };
    return lista.filter((a) => anuncioAplica(a, ubicacion, contexto, visitante));
  }

  private lista(): Observable<AnuncioPublico[]> {
    if (!enNavegador()) return of([]);
    if (!this.lista$ || Date.now() - this.pedidaEn > VIGENCIA_MS) {
      this.pedidaEn = Date.now();
      this.lista$ = this.http.get<ApiResponse<AnuncioPublico[]>>(`${environment.api}/api/anuncios`).pipe(
        map((r) => (r.status === 200 ? r.data ?? [] : [])),
        catchError(() => of([])),
        tap((lista) => (this.ultimaLista = lista)),
        shareReplay(1),
      );
    }
    return this.lista$;
  }

  private enviar(): void {
    clearTimeout(this.envio);
    this.envio = undefined;
    if (!this.pendientes.size) return;

    const eventos = Array.from(this.pendientes, ([anuncioId, v]) => ({ anuncioId, ...v }));
    this.pendientes.clear();
    // fetch y no HttpClient: con keepalive el envío termina aunque se cierre la pestaña, y no pasa por el loader.
    fetch(`${environment.api}/api/anuncios/metricas`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventos }),
    }).catch(() => undefined);
  }
}
