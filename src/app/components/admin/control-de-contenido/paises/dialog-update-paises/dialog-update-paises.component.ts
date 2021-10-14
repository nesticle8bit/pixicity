import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-update-paises',
  templateUrl: './dialog-update-paises.component.html',
  styleUrls: ['./dialog-update-paises.component.scss'],
})
export class DialogUpdatePaisesComponent implements OnInit {
  public formGroup: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private httpParametros: IHttpParametrosService
  ) {
    this.formGroup = this.formBuilder.group({
      id: [undefined],
      nombre: ['', Validators.required],
      iso2: ['', [Validators.required, Validators.maxLength(2)]],
      iso3: ['', [Validators.required, Validators.maxLength(3)]],
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue({
        id: this.data.id,
        nombre: this.data.nombre,
        iso2: this.data.isO2,
        iso3: this.data.isO3,
      });
    }
  }

  savePais(): void {
    if(this.formGroup.invalid) {
      return;
    }

    const pais = Object.assign({}, this.formGroup.value);

    this.httpParametros.savePais(pais).subscribe((response: any) => {
      if (response) {
        Swal.fire({
          title: 'Guardar',
          text: 'El pais se ha guardado correctamente',
          icon: 'success',
          timer: 3000,
        });
      }
    });
  }
}
