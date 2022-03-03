import { Component, OnInit } from '@angular/core';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

@Component({
  selector: 'app-dialog-change-avatar',
  templateUrl: './dialog-change-avatar.component.html',
  styleUrls: ['./dialog-change-avatar.component.scss'],
})
export class DialogChangeAvatarComponent implements OnInit {
  imageChangedEvent: any = '';
  croppedImage: any = '';

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded(image: LoadedImage) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
  constructor() {}

  ngOnInit(): void {}
}
