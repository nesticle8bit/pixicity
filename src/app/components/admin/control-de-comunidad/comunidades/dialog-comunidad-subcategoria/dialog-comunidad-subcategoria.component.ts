import { Component, DestroyRef, inject, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-dialog-comunidad-subcategoria',
  templateUrl: './dialog-comunidad-subcategoria.component.html',
  styleUrls: ['./dialog-comunidad-subcategoria.component.scss'],
})
export class DialogComunidadSubcategoriaComponent {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public categoria: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogComunidadSubcategoriaComponent>,
    private fb: FormBuilder,
    private comunidadesService: IHttpComunidadesService,
    private notificationService: NotificationService
  ) {
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

    this.comunidadesService.saveSubCategoria(model).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok: any) => {
      if (ok) {
        this.notificationService.success('Sub-categoría guardada', 'Guardado');
        this.dialogRef.close(true);
      }
    });
  }
}
