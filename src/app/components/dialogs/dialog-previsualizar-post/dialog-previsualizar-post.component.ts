import { Component, OnInit } from '@angular/core';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-previsualizar-post',
    templateUrl: './dialog-previsualizar-post.component.html',
    styleUrls: ['./dialog-previsualizar-post.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatDialogClose]
})
export class DialogPrevisualizarPostComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
