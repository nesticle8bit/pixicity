import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from 'ngx-editor';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import Swal from 'sweetalert2';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';

@Component({
  selector: 'app-dialog-update-afiliados',
  templateUrl: './dialog-update-afiliados.component.html',
  styleUrls: ['./dialog-update-afiliados.component.scss'],
})
export class DialogUpdateAfiliadosComponent implements OnInit {
  public formGroupAfiliacion: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogUpdateAfiliadosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private generalService: IHttpGeneralService,
    private formBuilder: FormBuilder
  ) {
    this.formGroupAfiliacion = this.formBuilder.group({
      activo: this.data.activo,
      banner: [this.data.banner, Validators.required],
      codigo: this.data.codigo,
      descripcion: this.data.descripcion,
      id: this.data.id,
      titulo: [this.data.titulo, Validators.required],
      url: [this.data.url, Validators.required],
    });
  }

  ngOnInit(): void {
  }

  updateAfiliacion(): void {
    if (this.formGroupAfiliacion.invalid) {
      return;
    }

    const afiliacion = Object.assign({}, this.formGroupAfiliacion.value);

    this.generalService.updateAfiliacion(afiliacion).subscribe((response: any) => {
      if (response) {
        Swal.fire({
          title: 'Actualizado',
          text: 'La información de la afiliación ha sido actualizada correctamente',
          icon: 'success',
          timer: 3000,
        });

        this.dialogRef.close(afiliacion);
      }
    });
  }
}
