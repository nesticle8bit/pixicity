import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-dialog-display-history-comments',
    templateUrl: './dialog-display-history-comments.component.html',
    styleUrls: ['./dialog-display-history-comments.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatDialogClose, DatePipe]
})
export class DialogDisplayHistoryCommentsComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);


  ngOnInit(): void {
  }

}
