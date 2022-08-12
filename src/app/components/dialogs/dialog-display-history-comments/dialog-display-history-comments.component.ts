import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-display-history-comments',
  templateUrl: './dialog-display-history-comments.component.html',
  styleUrls: ['./dialog-display-history-comments.component.scss']
})
export class DialogDisplayHistoryCommentsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

}
