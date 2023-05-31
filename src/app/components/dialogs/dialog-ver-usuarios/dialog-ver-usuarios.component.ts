import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog-ver-usuarios',
  templateUrl: './dialog-ver-usuarios.component.html',
  styleUrls: ['./dialog-ver-usuarios.component.scss'],
})
export class DialogVerUsuariosComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    console.log(this.data);
  }
}
