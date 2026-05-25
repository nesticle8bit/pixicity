import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  standalone: false,
  selector: 'app-dialog-create-update-paginas',
  templateUrl: './dialog-create-update-paginas.component.html',
  styleUrls: ['./dialog-create-update-paginas.component.scss'],
})
export class DialogCreateUpdatePaginasComponent implements OnInit {
  public formGroup: FormGroup;
  public tipos: any[] = ['routerLink', 'link'];
  public targets: any[] = ['_blank', '_parent', '_self', '_top'];

  constructor(
    public dialogRef: MatDialogRef<DialogCreateUpdatePaginasComponent>,
    private webService: IHttpWebService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      id: 0,
      titulo: ['', Validators.required],
      slug: [''],
      tipo: [''],
      target: [''],
      contenido: [''],
      eliminado: false,
    });

  }

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue({
        id: this.data.id,
        titulo: this.data.titulo,
        slug: this.data.slug,
        tipo: this.data.tipo,
        target: this.data.target,
        contenido: this.data.contenido,
        eliminado: this.data.eliminado ?? false,
      });
    }
  }

  savePagina(): void {
    const value = Object.assign({}, this.formGroup.value);
    this.webService.savePagina(value).subscribe((response: any) => {
      if (response) {
        if (value.id) {
          Swal.fire({
            title: 'Actualizar',
            text: 'La página se ha actualizado correctamente',
            icon: 'success',
            timer: 3000,
          });
        } else {
          Swal.fire({
            title: 'Guardar',
            text: 'La página se ha guardado correctamente',
            icon: 'success',
            timer: 3000,
          });
        }

        this.dialogRef.close(response);
      }
    });
  }
}
