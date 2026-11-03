import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { AnalisisUsuario, GravedadSenal } from 'src/app/models/admin/moderacion.model';
import { IHttpModeracionService } from 'src/app/services/interfaces/httpModeracion.interface';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';

export interface DialogAnalisisUsuarioData {
  usuarioId: number;
  userName: string;
}

const ICONO_GRAVEDAD: Record<GravedadSenal, string> = {
  alta: 'ti-alert-octagon',
  media: 'ti-alert-triangle',
  baja: 'ti-info-circle',
};

/**
 * Staff, desde el perfil: ¿farmea puntos, los concentra en una cuenta o tiene otra cuenta que se los regala?
 * Muestra las señales que calcula el API y los números detrás de cada una.
 */
@Component({
  selector: 'app-dialog-analisis-usuario',
  templateUrl: './dialog-analisis-usuario.component.html',
  styleUrls: ['./dialog-analisis-usuario.component.scss'],
  imports: [MatDialogTitle, MatDialogContent, MatDialogClose, RouterLink, DatePipe, DecimalPipe, UserAvatarComponent],
})
export class DialogAnalisisUsuarioComponent {
  readonly data = inject<DialogAnalisisUsuarioData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<DialogAnalisisUsuarioComponent>>(MatDialogRef);
  private readonly moderacion = inject(IHttpModeracionService);

  readonly analisis = signal<AnalisisUsuario | null>(null);
  readonly error = signal(false);
  readonly icono = ICONO_GRAVEDAD;

  constructor() {
    this.moderacion
      .getAnalisisUsuario(this.data.usuarioId)
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe({
        next: (a) => this.analisis.set(a),
        error: () => this.error.set(true),
      });
  }

  /** Clase del nivel: sin-senales, bajo, medio, alto. */
  claseNivel(nivel: string): string {
    return nivel === 'Sin señales' ? 'sin-senales' : nivel.toLowerCase();
  }

  /** Al ir a otro perfil se cierra: el análisis es del usuario anterior. */
  cerrar(): void {
    this.dialogRef.close();
  }
}
