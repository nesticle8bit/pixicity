import { Component, DestroyRef, inject, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-dialog-comunidad-categoria',
  templateUrl: './dialog-comunidad-categoria.component.html',
  styleUrls: ['./dialog-comunidad-categoria.component.scss'],
})
export class DialogComunidadCategoriaComponent {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogComunidadCategoriaComponent>,
    private fb: FormBuilder,
    private comunidadesService: IHttpComunidadesService,
    private notificationService: NotificationService
  ) {
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

    this.comunidadesService.saveCategoria(model).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok: any) => {
      if (ok) {
        this.notificationService.success('Categoría guardada', 'Guardado');
        this.dialogRef.close(true);
      }
    });
  }
}
