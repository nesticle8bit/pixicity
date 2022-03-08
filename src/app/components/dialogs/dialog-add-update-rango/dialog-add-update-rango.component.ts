import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators } from 'ngx-editor';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-add-update-rango',
  templateUrl: './dialog-add-update-rango.component.html',
  styleUrls: ['./dialog-add-update-rango.component.scss'],
})
export class DialogAddUpdateRangoComponent implements OnInit {
  public iconos: string[] = [
    'administrador.png',
    'amateur.png',
    'aprendiz.gif',
    'avanzado.gif',
    'baneado.gif',
    'desarrollador.gif',
    'diamond.gif',
    'elite.gif',
    'experto.gif',
    'flamer.gif',
    'fullUser.gif',
    'gold.gif',
    'greatUser.gif',
    'inexperto.gif',
    'iniciado.gif',
    'moderador.gif',
    'novato.png',
    'oficial.gif',
    'platinum.gif',
    'regular.gif',
    'rockstar.gif',
    'silver.gif',
  ];

  public formGroup: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DialogAddUpdateRangoComponent>,
    private securityService: IHttpSecurityService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      id: 0,
      nombre: ['', Validators.required],
      icono: ['', Validators.required],
      tipo: [undefined, Validators.required],
      color: ['', Validators.required],
      puntos: [undefined]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue({
        id: this.data.id,
        nombre: this.data.nombre,
        icono: this.data.icono,
        tipo: this.data.tipo.toString(),
        color: this.data.color,
        puntos: this.data.puntos
      });
    }
  }

  saveRango(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const rango = Object.assign({}, this.formGroup.value);
    rango.tipo = parseInt(rango.tipo);

    this.securityService.addUpdateRango(rango).subscribe((value: number) => {
      if (value) {
        Swal.fire({
          title: 'Guardado',
          text: 'El rango se ha guardado correctamente',
          icon: 'success',
          timer: 3000,
        });

        this.dialogRef.close(value);
      }
    });
  }
}
