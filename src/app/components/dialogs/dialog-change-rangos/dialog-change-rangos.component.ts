import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from 'ngx-editor';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-change-rangos',
  templateUrl: './dialog-change-rangos.component.html',
  styleUrls: ['./dialog-change-rangos.component.scss'],
})
export class DialogChangeRangosComponent implements OnInit {
  public formGroup: FormGroup;
  public rangos: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogChangeRangosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private securityService: IHttpSecurityService,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      id: 0,
      usuarioId: 0,
      icono: '',
      color: '',
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue({
        id: this.data.id,
        usuarioId: this.data.usuarioId,
        icono: this.data.icono,
        color: this.data.color,
      });
    }

    this.securityService.getRangosDropdown().subscribe((response: any) => {
      this.rangos = response;
    });
  }

  changeRango(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const obj = Object.assign({}, this.formGroup.value);

    this.securityService.changeRango(obj).subscribe((response: any) => {
      if (response) {
        Swal.fire({
          title: 'Actualizado',
          text: 'El rango del usuario ha sido actualizado correctamente',
          icon: 'success',
          timer: 3000,
        });

        this.dialogRef.close(obj.rango);
      }
    });
  }
}
