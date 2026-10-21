import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IHttpModeracionService } from 'src/app/services/interfaces/httpModeracion.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { merge } from 'rxjs';

interface PestanaModeracion {
  label: string;
  icon: string;
  route: string;
}

/**
 * Sección de moderación para moderadores y administradores: reportes, posts, shouts, comentarios y usuarios.
 * Reutiliza las tablas del panel admin; todo lo que se hace aquí queda en /mod-history.
 */
@Component({
  selector: 'app-moderacion-panel',
  templateUrl: './moderacion-panel.component.html',
  styleUrls: ['./moderacion-panel.component.scss'],
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
})
export class ModeracionPanelComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private moderacionService = inject(IHttpModeracionService);
  private signalrService = inject(SignalrService);
  private title = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

  /** Reportes sin resolver, para el contador de la pestaña. */
  readonly pendientes = signal(0);

  readonly pestanas: PestanaModeracion[] = [
    { label: 'Reportes', icon: 'ti-flag', route: 'reportes' },
    { label: 'Posts', icon: 'ti-file-text', route: 'posts' },
    { label: 'Shouts', icon: 'ti-message-circle', route: 'shouts' },
    { label: 'Comentarios', icon: 'ti-messages', route: 'comentarios' },
    { label: 'Apelaciones', icon: 'ti-scale', route: 'apelaciones' },
    { label: 'Usuarios', icon: 'ti-users', route: 'usuarios' },
  ];

  constructor() {
    this.title.setTitle('Moderación | Taringa - Inteligencia colectiva | Comunidad para Compartir Información');
  }

  ngOnInit(): void {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: false,
      submenu: true,
      background: '',
    });

    this.contarPendientes();
    // El contador de la pestaña sigue en vivo: reportes nuevos y los que atiende cualquier moderador.
    merge(this.signalrService.newReport$, this.signalrService.reporteAtendido$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.contarPendientes());
  }

  private contarPendientes(): void {
    this.moderacionService
      .getReportes(1, 1, null, true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((pagina) => this.pendientes.set(pagina?.pendientes ?? 0));
  }
}
