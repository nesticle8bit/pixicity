import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-dialog-change-avatar',
  templateUrl: './dialog-change-avatar.component.html',
  styleUrls: ['./dialog-change-avatar.component.scss'],
})
export class DialogChangeAvatarComponent implements OnInit {
  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(
    private securityService: IHttpSecurityService,
    public dialogRef: MatDialogRef<DialogChangeAvatarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notificationService: NotificationService
  ) {}

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
      this.securityService.changeAvatarAdmin(imageFile, this.data?.usuario?.id).subscribe((response: any) => {
        if (response) {
          this.dialogRef.close(response);
          this.notificationService.success(`El avatar del usuario ${this.data?.usuario?.userName} ha sido actualizado correctamente`, 'Actualizado');
        }
      });
    } else {
      this.securityService.changeAvatar(imageFile).subscribe((response: any) => {
        if (response) {
          let currentUser = this.securityService.getCurrentUser();
          currentUser.usuario.avatar = 'avatar.jpeg';
          this.securityService.setUserToLocalStorage(currentUser);
  
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
