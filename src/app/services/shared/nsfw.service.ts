import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Observable, tap } from 'rxjs';
import { ApiResponse } from 'src/app/models/api/api-response.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { environment } from 'src/environments/environment';

/**
 * Preferencia "ver los shouts NSFW sin difuminar" (/cuenta → Contenido sensible). Vive en la cuenta (Usuario.MostrarNsfw)
 * y se copia en la sesión guardada, así app-shout-media la lee sin pedirla al API. Sin sesión, siempre difuminado.
 */
@Injectable({ providedIn: 'root' })
export class NsfwService {
  private readonly http = inject(HttpClient);
  private readonly securityService = inject(IHttpSecurityService);

  readonly mostrar = toSignal(
    this.securityService.getCurrentUserAsObservable().pipe(map((s) => !!s?.usuario?.mostrarNsfw)),
    { initialValue: !!this.securityService.getCurrentUser()?.usuario?.mostrarNsfw },
  );

  /** El API exige 18+ con fecha de nacimiento cargada para activarlo (si no, responde 403 con el motivo). */
  establecer(mostrar: boolean): Observable<boolean> {
    return this.http.put<ApiResponse<{ mostrarNsfw: boolean }>>(`${environment.api}/api/usuarios/me/nsfw`, { mostrar }).pipe(
      map((r) => !!r.data?.mostrarNsfw),
      tap((valor) => this.recordar(valor)),
    );
  }

  /** Sincroniza la sesión guardada con lo que dice la cuenta (p. ej. al cargar /cuenta). */
  recordar(valor: boolean): void {
    const actual = this.securityService.getCurrentUser();
    if (!actual?.usuario || !!actual.usuario.mostrarNsfw === valor) return;
    this.securityService.setUserToLocalStorage({ ...actual, usuario: { ...actual.usuario, mostrarNsfw: valor } });
  }
}
