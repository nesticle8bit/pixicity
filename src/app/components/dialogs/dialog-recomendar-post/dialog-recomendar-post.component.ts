import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-dialog-recomendar-post',
  templateUrl: './dialog-recomendar-post.component.html',
  styleUrls: ['./dialog-recomendar-post.component.scss'],
})
export class DialogRecomendarPostComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogRecomendarPostComponent>,
    private postService: IHttpPostsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {}

  recomendarPost(): void {
    if (!this.data) {
      return;
    }

    this.postService.recomendarPost(this.data).subscribe((response: any) => {
      if ((response !== undefined || response !== null) && response === 0) {
        this.notificationService.info('Debes tener al menos un seguidor para poder recomendar posts', 'Recomendar Posts');
      }

      this.dialogRef.close();
    });
  }
}
