import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-comunidad-categoria',
    templateUrl: './dialog-comunidad-categoria.component.html',
    styleUrls: ['./dialog-comunidad-categoria.component.scss'],
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
export class DialogComunidadCategoriaComponent {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<DialogComunidadCategoriaComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);
  private comunidadesService = inject(IHttpComunidadesService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;

  constructor() {
    this.formGroup = this.fb.group({
      id: [this.data?.id ?? 0],
      nombre: [this.data?.nombre, Validators.required],
      seo: [this.data?.seo],
      orden: [this.data?.orden ?? 0],
    });
  }

  guardar(): void {
    if (this.formGroup.invalid) return;
    const model = Object.assign({}, this.formGroup.value);
    model.orden = +model.orden;

    this.comunidadesService.saveCategoria(model).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok) => {
      if (ok) {
        this.notificationService.success('Categoría guardada', 'Guardado');
        this.dialogRef.close(true);
      }
    });
  }
}
