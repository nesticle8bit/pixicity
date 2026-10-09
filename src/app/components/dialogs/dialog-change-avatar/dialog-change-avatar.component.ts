import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';

// Standalone + import() diferido: el cropper solo se usa en el panel de admin.
@Component({
  standalone: true,
  imports: [ImageCropperComponent, MatButtonModule, MatDialogModule],
  selector: 'app-dialog-change-avatar',
  templateUrl: './dialog-change-avatar.component.html',
  styleUrls: ['./dialog-change-avatar.component.scss'],
})
export class DialogChangeAvatarComponent implements OnInit {
  private securityService = inject(IHttpSecurityService);
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  dialogRef = inject<MatDialogRef<DialogChangeAvatarComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  imageChangedEvent: any = '';
  croppedImage: any = '';

  ngOnInit(): void {}

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64;
  }

  loadImageFailed(): void {
    this.notificationService.error('Se ha encontrado un error al tratar de actualizar la imagen de perfil, por favor recarga la página', 'Error');
  }

  saveAvatar(): void {
    if (!this.croppedImage) {
      return;
    }

    const imageBlob = this.dataURItoBlob(this.croppedImage);
    const imageFile = new File([imageBlob], 'avatar.jpeg', {
      type: 'image/jpeg',
    });

    if(this.data?.isAdmin) {
      this.securityService.changeAvatarAdmin(imageFile, this.data?.usuario?.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        if (response) {
          this.dialogRef.close(response);
          this.notificationService.success(`El avatar del usuario ${this.data?.usuario?.userName} ha sido actualizado correctamente`, 'Actualizado');
        }
      });
    } else {
      this.usuarioPerfilService.changeAvatar(imageFile).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        if (response) {
          const currentUser = this.securityService.getCurrentUser();
          if (currentUser.usuario) {
            currentUser.usuario.avatar = 'avatar.jpeg';
            this.securityService.setUserToLocalStorage(currentUser);
          }
  
          this.dialogRef.close(response);
        }
      });
    }
  }

  dataURItoBlob(dataURI: string): Blob {
    dataURI = dataURI.replace('data:image/jpeg;base64,', '');

    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }
}
