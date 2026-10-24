import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { EstadoApelacion, MiModeracion } from 'src/app/models/admin/moderacion.model';
import { IHttpModeracionService } from 'src/app/services/interfaces/httpModeracion.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

/** Lo que el equipo moderó de tu cuenta (90 días) y la opción de apelarlo (30 días). */
@Component({
  selector: 'app-apelaciones',
  templateUrl: './apelaciones.component.html',
  styleUrls: ['./apelaciones.component.scss'],
  imports: [FormsModule, RouterLink, TimeAgoPipe],
})
export class ApelacionesComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private moderacionService = inject(IHttpModeracionService);
  private notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly Estado = EstadoApelacion;
  readonly items = signal<MiModeracion[]>([]);
  readonly cargando = signal(true);

  /** Formulario abierto (id de la acción) y su texto. */
  public abierta: number | null = null;
  public mensaje = '';
  public enviando = false;

  constructor() {
    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: false, submenu: true, background: '' });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.moderacionService
      .getMisModeraciones()
      .pipe(finalize(() => this.cargando.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => this.items.set(items ?? []));
  }

  abrir(item: MiModeracion): void {
    this.abierta = item.moderacionLogId;
    this.mensaje = '';
  }

  enviar(item: MiModeracion): void {
    const mensaje = this.mensaje.trim();
    if (mensaje.length < 20 || this.enviando) return;
    this.enviando = true;
    this.moderacionService
      .apelar(item.moderacionLogId, mensaje)
      .pipe(finalize(() => (this.enviando = false)), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.notificationService.success('Una persona del equipo la va a revisar. Te avisamos cuando haya respuesta.', 'Apelación enviada');
        this.abierta = null;
        this.cargar();
      });
  }
}
