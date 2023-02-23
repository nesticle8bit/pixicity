import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-create-update-noticias',
  templateUrl: './dialog-create-update-noticias.component.html',
  styleUrls: ['./dialog-create-update-noticias.component.scss']
})
export class DialogCreateUpdateNoticiasComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

}
