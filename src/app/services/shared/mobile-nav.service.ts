import { Injectable, signal, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { debounceTime, filter, merge } from 'rxjs';
import { IHttpLogsService } from '../interfaces/httpLogs.interface';
import { IHttpSecurityService } from '../interfaces/httpSecurity.interface';
import { MensajesBadgeService } from './mensajes-badge.service';
import { SignalrService } from './signalr.service';

// Debajo de este ancho (px) el menú de usuario del header se reemplaza por el cajón móvil (breakpoint md de Bootstrap).
export const MOBILE_MAX_WIDTH = 767.98;

// Estado del menú hamburguesa móvil: abierto/cerrado y contadores de no leídos (notificaciones y mensajes).
@Injectable({ providedIn: 'root' })
export class MobileNavService {
  private logsService = inject(IHttpLogsService);
  private securityService = inject(IHttpSecurityService);
  private signalrService = inject(SignalrService);
  private badgeService = inject(MensajesBadgeService);
  private router = inject(Router);

  public readonly isOpen = signal(false);
  public readonly stats = signal({ notifications: 0, messages: 0 });

  private watching = false;

  open(): void {
    this.isOpen.set(true);
    this.loadStats();
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  // Mantiene los contadores al día mientras vive la app. Idempotente.
  watchStats(): void {
    if (this.watching) {
      return;
    }

    this.watching = true;
    this.loadStats();

    this.signalrService.notification$.subscribe(() =>
      this.stats.update((s) => ({ ...s, notifications: s.notifications + 1 }))
    );

    // Recalcular tras eventos de mensajes y al navegar (p. ej. abrir /monitor o un chat marca como leído).
    merge(
      this.signalrService.mensaje$,
      this.signalrService.mensajesLeidos$,
      this.badgeService.refresh$,
      this.router.events.pipe(filter((e) => e instanceof NavigationEnd))
    )
      .pipe(debounceTime(500))
      .subscribe(() => this.loadStats());
  }

  // Solo consulta en móvil y con sesión: en escritorio ya lo hace el menú del header.
  private loadStats(): void {
    if (!this.isMobile() || !this.securityService.getCurrentUser()?.usuario) {
      return;
    }

    this.logsService.getStats().subscribe({
      next: (value: any) =>
        this.stats.set({ notifications: value?.notifications ?? 0, messages: value?.messages ?? 0 }),
      error: () => {},
    });
  }

  private isMobile(): boolean {
    return typeof window !== 'undefined' && window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
  }
}
