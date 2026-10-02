import { environment } from 'src/environments/environment';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-dialog-afiliarse',
  templateUrl: './dialog-afiliarse.component.html',
  styleUrls: ['./dialog-afiliarse.component.scss'],
})
export class DialogAfiliarseComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

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
      codigo: [],
    });
  }

  ngOnInit(): void {}

  enviarAfiliacion(): void {
    if (this.formGroupAfiliacion.invalid) {
      return;
    }

    // "codigo" es solo la respuesta que se muestra al usuario; no se envía.
    const { codigo, ...afiliacion } = this.formGroupAfiliacion.value;

    this.httpGeneralService
      .saveAfiliacion(afiliacion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (response) {
          this.formGroupAfiliacion.patchValue({
            codigo: `<a href="${environment.publicUrl}/?ref=${response}" target="_blank" title="Taringa!"><img src="${environment.publicUrl}/assets/images/logo_ref.png"></a>`,
          });
        }
      });
  }
}
