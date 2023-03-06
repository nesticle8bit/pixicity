import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators } from 'ngx-editor';
import { IHttpNoticiasService } from 'src/app/services/interfaces/httpNoticias.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-create-update-noticias',
  templateUrl: './dialog-create-update-noticias.component.html',
  styleUrls: ['./dialog-create-update-noticias.component.scss'],
})
export class DialogCreateUpdateNoticiasComponent implements OnInit {
  public formGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogCreateUpdateNoticiasComponent>,
    private noticiasService: IHttpNoticiasService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      id: 0,
      contenido: ['', Validators.required],
      eliminado: false,
    });
  }

  ngOnInit(): void {
    if (this.data?.id) {
      this.formGroup.patchValue({
        id: this.data?.id,
        contenido: this.data?.contenido,
        eliminado: this.data?.eliminado,
      });
    }
  }

  saveNoticia(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const value = Object.assign({}, this.formGroup.value);

    if (value.id) {
      this.noticiasService.updateNoticias(value).subscribe((response: any) => {
        Swal.fire({
          title: 'Actualizar',
          text: 'La noticia se ha actualizado correctamente',
          icon: 'success',
          timer: 3000,
        });

        this.dialogRef.close(true);
      });
    } else {
      this.noticiasService.saveNoticias(value).subscribe((response: any) => {
        Swal.fire({
          title: 'Guardar',
          text: 'La noticia se ha guardado correctamente',
          icon: 'success',
          timer: 3000,
        });

        this.dialogRef.close(true);
      });
    }
  }
}
