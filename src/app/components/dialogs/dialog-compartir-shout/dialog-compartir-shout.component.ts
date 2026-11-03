import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { idUsuarioSesion } from 'src/app/models/security/jwtUser.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { ShoutComposerComponent } from '../../shared/shouts/shout-composer/shout-composer.component';

export interface DialogCompartirShoutData {
  /** Enlace que queda adjunto al shout (post, tema, foto...). */
  url: string;
}

/** Compartir un enlace en los shouts propios: el composer de siempre con el enlace ya cargado. */
@Component({
  selector: 'app-dialog-compartir-shout',
  templateUrl: './dialog-compartir-shout.component.html',
  styleUrls: ['./dialog-compartir-shout.component.scss'],
  imports: [MatDialogTitle, MatDialogContent, MatDialogClose, ShoutComposerComponent],
})
export class DialogCompartirShoutComponent {
  readonly data = inject<DialogCompartirShoutData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<DialogCompartirShoutComponent>>(MatDialogRef);
  private readonly notificationService = inject(NotificationService);

  readonly perfilId = idUsuarioSesion(inject(IHttpSecurityService).getCurrentUser()?.usuario);

  alPublicar(): void {
    this.notificationService.success('Se publicó en tus shouts', 'Compartir');
    this.dialogRef.close(true);
  }
}
