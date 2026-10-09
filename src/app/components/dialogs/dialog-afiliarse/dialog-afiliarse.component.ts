import { environment } from 'src/environments/environment';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-afiliarse',
    templateUrl: './dialog-afiliarse.component.html',
    styleUrls: ['./dialog-afiliarse.component.scss'],
    imports: [
        MatDialogTitle,
        FormsModule,
        ReactiveFormsModule,
        CdkScrollable,
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class DialogAfiliarseComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private httpGeneralService = inject(IHttpGeneralService);
  dialogRef = inject<MatDialogRef<DialogAfiliarseComponent>>(MatDialogRef);

  private readonly destroyRef = inject(DestroyRef);

  public formGroupAfiliacion: FormGroup;

  constructor() {
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
      .subscribe((response) => {
        if (response) {
          this.formGroupAfiliacion.patchValue({
            codigo: `<a href="${environment.publicUrl}/?ref=${response}" target="_blank" title="Taringa!"><img src="${environment.publicUrl}/assets/images/logo_ref.png"></a>`,
          });
        }
      });
  }
}
