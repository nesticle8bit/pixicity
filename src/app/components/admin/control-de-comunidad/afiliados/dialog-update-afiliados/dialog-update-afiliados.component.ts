import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-update-afiliados',
    templateUrl: './dialog-update-afiliados.component.html',
    styleUrls: ['./dialog-update-afiliados.component.scss'],
    imports: [
        MatDialogTitle,
        FormsModule,
        ReactiveFormsModule,
        CdkScrollable,
        MatDialogContent,
        MatSlideToggle,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class DialogUpdateAfiliadosComponent implements OnInit {
  dialogRef = inject<MatDialogRef<DialogUpdateAfiliadosComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private generalService = inject(IHttpGeneralService);
  private formBuilder = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroupAfiliacion: FormGroup;

  constructor() {
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

    this.generalService.updateAfiliacion(afiliacion).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.notificationService.success('La información de la afiliación ha sido actualizada correctamente', 'Actualizado');

        this.dialogRef.close(afiliacion);
      }
    });
  }
}
