import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// Canal para que las vistas de mensajes avisen al menú que el contador de no leídos cambió
// (p. ej. al abrir un chat, que marca los mensajes como leídos).
@Injectable({ providedIn: 'root' })
export class MensajesBadgeService {
  private refreshSubject = new Subject<void>();

  public refresh$: Observable<void> = this.refreshSubject.asObservable();

  refresh(): void {
    this.refreshSubject.next();
  }
}
