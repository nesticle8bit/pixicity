import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-recomendar-post',
    templateUrl: './dialog-recomendar-post.component.html',
    styleUrls: ['./dialog-recomendar-post.component.scss'],
    imports: [
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class DialogRecomendarPostComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<DialogRecomendarPostComponent>>(MatDialogRef);
  private postService = inject(IHttpPostsService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {}

  recomendarPost(): void {
    if (!this.data) {
      return;
    }

    this.postService.recomendarPost(this.data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if ((response !== undefined || response !== null) && response === 0) {
        this.notificationService.info('Debes tener al menos un seguidor para poder recomendar posts', 'Recomendar Posts');
      }

      this.dialogRef.close();
    });
  }
}
