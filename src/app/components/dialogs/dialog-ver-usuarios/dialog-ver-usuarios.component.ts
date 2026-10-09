import { MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, OnInit, inject } from '@angular/core';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { TableUsuariosComponent } from '../../admin/usuarios/usuarios/table-usuarios/table-usuarios.component';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-ver-usuarios',
    templateUrl: './dialog-ver-usuarios.component.html',
    styleUrls: ['./dialog-ver-usuarios.component.scss'],
    imports: [
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        TableUsuariosComponent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class DialogVerUsuariosComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);


  ngOnInit(): void {
    console.log(this.data);
  }
}
