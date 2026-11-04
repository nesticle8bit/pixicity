import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { Medalla, MedallaOtorgada, srcMedalla } from 'src/app/models/seguridad/medalla.model';
import { IHttpMedallasService } from 'src/app/services/interfaces/httpMedallas.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { UserAvatarComponent } from 'src/app/components/addons/user-avatar/user-avatar.component';

/** Quiénes tienen una medalla: otorgarla a un usuario (con motivo opcional) o quitársela. */
@Component({
  selector: 'app-dialog-medalla-usuarios',
  templateUrl: './dialog-medalla-usuarios.component.html',
  styleUrl: './dialog-medalla-usuarios.component.scss',
  imports: [FormsModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, DatePipe, RouterLink,
    UserAvatarComponent],
})
export class DialogMedallaUsuariosComponent implements OnInit {
  private readonly medallas = inject(IHttpMedallasService);
  private readonly notificaciones = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly medalla = inject<Medalla>(MAT_DIALOG_DATA);
  readonly src = srcMedalla;

  readonly otorgadas = signal<MedallaOtorgada[]>([]);
  readonly cargando = signal(true);
  readonly enviando = signal(false);
  userName = '';
  motivo = '';

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.medallas.getOtorgadas(this.medalla.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (lista) => { this.otorgadas.set(lista ?? []); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  otorgar(): void {
    const userName = this.userName.trim().replace(/^@/, '');
    if (!userName || this.enviando()) return;
    this.enviando.set(true);
    this.medallas.otorgar(this.medalla.id, userName, this.motivo.trim()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.enviando.set(false);
        this.userName = '';
        this.motivo = '';
        this.notificaciones.success(`Medalla otorgada a @${userName}`, 'Medallas');
        this.cargar();
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.notificaciones.error(e instanceof Error ? e.message : 'No se pudo otorgar', 'Medallas');
      },
    });
  }

  async quitar(o: MedallaOtorgada): Promise<void> {
    if (!(await this.notificaciones.confirm(`¿Quitarle «${this.medalla.titulo}» a @${o.userName}?`))) return;
    this.medallas.quitar(this.medalla.id, o.usuarioId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.otorgadas.update((lista) => lista.filter((x) => x.usuarioId !== o.usuarioId));
      },
      error: (e: unknown) => this.notificaciones.error(e instanceof Error ? e.message : 'No se pudo quitar', 'Medallas'),
    });
  }
}
