import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-change-avatar',
  templateUrl: './dialog-change-avatar.component.html',
  styleUrls: ['./dialog-change-avatar.component.scss'],
})
export class DialogChangeAvatarComponent implements OnInit {
  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(
    private securityService: IHttpSecurityService,
    public dialogRef: MatDialogRef<DialogChangeAvatarComponent>
  ) {}

  ngOnInit(): void {}

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64;
  }

  loadImageFailed(): void {
    Swal.fire({
      title: 'Error',
      text: 'Se ha encontrado un error al tratar de actualizar la imagen de perfil, por favor recarga la página',
      icon: 'error',
    });
  }

  saveAvatar(): void {
    if (!this.croppedImage) {
      return;
    }

    const imageBlob = this.dataURItoBlob(this.croppedImage);
    const imageFile = new File([imageBlob], 'avatar.jpeg', {
      type: 'image/jpeg',
    });

    this.securityService.changeAvatar(imageFile).subscribe((response: any) => {
      if (response) {
        debugger
        let currentUser = this.securityService.getCurrentUser();
        currentUser.usuario.avatar = 'avatar.jpeg';
        this.securityService.setUserToLocalStorage(currentUser);

        this.dialogRef.close(response);
      }
    });
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
