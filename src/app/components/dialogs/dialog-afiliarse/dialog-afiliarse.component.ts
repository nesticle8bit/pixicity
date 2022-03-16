import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog-afiliarse',
  templateUrl: './dialog-afiliarse.component.html',
  styleUrls: ['./dialog-afiliarse.component.scss']
})
export class DialogAfiliarseComponent implements OnInit {
  public formGroupAfiliacion: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private httpGeneralService: IHttpGeneralService,
    public dialogRef: MatDialogRef<DialogAfiliarseComponent>
  ) {
    this.formGroupAfiliacion = this.formBuilder.group({
      titulo: ['', Validators.required],
      url: ['http://', Validators.required],
      banner: ['http://', Validators.required],
      descripcion: ['', Validators.required],
      codigo: []
    });
  }

  ngOnInit(): void {
  }

  enviarAfiliacion(): void {
    if (this.formGroupAfiliacion.invalid) {
      return;
    }

    const afiliacion = Object.assign({}, this.formGroupAfiliacion.value);
    this.httpGeneralService.saveAfiliacion(afiliacion).subscribe((response: any) => {
      if (response) {
        this.formGroupAfiliacion.patchValue({
          codigo: `<a href="https://pixicity.net/?ref=${response}" target="_blank" title="Pixicity"><img src="https://pixicity.net/assets/images/logo_ref.png"></a>`
        });
      }
    });
  }

}
