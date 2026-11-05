import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Puente entre el chat abierto (panel derecho) y la lista de conversaciones (izquierda) de /mensajes: el evento en
 * vivo `mensaje$` solo llega por lo que pasa en otras pestañas, así que lo que hago en este chat (enviar, archivar,
 * silenciar, leer) se avisa por aquí para que la lista se refresque al momento.
 */
@Injectable({ providedIn: 'root' })
export class MensajesListaService {
  private readonly cambio = new Subject<void>();
  readonly cambio$ = this.cambio.asObservable();

  avisar(): void {
    this.cambio.next();
  }
}
