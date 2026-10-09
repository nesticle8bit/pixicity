import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-comunidad-subcategoria',
    templateUrl: './dialog-comunidad-subcategoria.component.html',
    styleUrls: ['./dialog-comunidad-subcategoria.component.scss'],
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
export class DialogComunidadSubcategoriaComponent {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<DialogComunidadSubcategoriaComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);
  private comunidadesService = inject(IHttpComunidadesService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public categoria: any;

  constructor() {
    this.categoria = this.data?.categoria;
    const sub = this.data?.sub;
    this.formGroup = this.fb.group({
      id: [sub?.id ?? 0],
      comunidadCategoriaId: [this.categoria?.id, Validators.required],
      nombre: [sub?.nombre, Validators.required],
      orden: [sub?.orden ?? 0],
    });
  }

  guardar(): void {
    if (this.formGroup.invalid) return;
    const model = Object.assign({}, this.formGroup.value);
    model.orden = +model.orden;

    this.comunidadesService.saveSubCategoria(model).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok) => {
      if (ok) {
        this.notificationService.success('Sub-categoría guardada', 'Guardado');
        this.dialogRef.close(true);
      }
    });
  }
}
