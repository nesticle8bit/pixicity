import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { Medalla, NIVELES_MEDALLA, NOMBRES_PERIODO, ReglaMedalla, srcMedalla } from 'src/app/models/seguridad/medalla.model';
import { MEDALLAS_DE_SERIE } from 'src/app/models/seguridad/medallas-de-serie';
import { IHttpMedallasService } from 'src/app/services/interfaces/httpMedallas.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

/** Alta o edición de una medalla: título, nivel, imagen (de serie o URL https), orden y si está activa. */
@Component({
  selector: 'app-dialog-medalla',
  templateUrl: './dialog-medalla.component.html',
  styleUrl: './dialog-medalla.component.scss',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, MatTooltip],
})
export class DialogMedallaComponent {
  private readonly dialogRef = inject<MatDialogRef<DialogMedallaComponent, boolean>>(MatDialogRef);
  private readonly medallas = inject(IHttpMedallasService);
  private readonly notificaciones = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly data = inject<Medalla | null>(MAT_DIALOG_DATA);

  readonly niveles = NIVELES_MEDALLA;
  readonly deSerie = MEDALLAS_DE_SERIE.map((slug) => `assets/medallas/${slug}.png`);
  readonly src = srcMedalla;
  guardando = false;

  readonly form = inject(FormBuilder).nonNullable.group({
    titulo: [this.data?.titulo ?? '', [Validators.required, Validators.maxLength(80)]],
    slug: [this.data?.slug ?? '', [Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), Validators.maxLength(80)]],
    descripcion: [this.data?.descripcion ?? '', Validators.maxLength(300)],
    nivel: [this.data?.nivel ?? 'Bronce', Validators.required],
    imagen: [this.data?.imagen ?? this.deSerie[0], Validators.required],
    orden: [this.data?.orden ?? 0],
    activa: [this.data?.activa ?? true],
    regla: [this.data?.regla ?? ''],
    umbral: [this.data?.umbral ?? (null as number | null)],
    periodo: [this.data?.periodo ?? 'semana'],
    puesto: [this.data?.puesto ?? 1],
  });

  /** Reglas automáticas que ofrece el API (vacío = la medalla es manual). */
  reglas: ReglaMedalla[] = [];
  readonly periodos = Object.entries(NOMBRES_PERIODO);

  constructor() {
    this.medallas.getReglas().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => (this.reglas = r?.reglas ?? []), error: () => (this.reglas = []) });
  }

  get reglaElegida(): ReglaMedalla | undefined {
    return this.reglas.find((r) => r.codigo === this.form.value.regla);
  }

  elegirImagen(imagen: string): void {
    this.form.patchValue({ imagen });
  }

  guardar(): void {
    if (this.form.invalid || this.guardando) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    // Solo se manda lo que usa la regla elegida (el API también lo normaliza).
    const valor = this.form.getRawValue();
    const regla = this.reglaElegida;
    const medalla: Partial<Medalla> = {
      ...valor,
      id: this.data?.id ?? 0,
      regla: regla?.codigo ?? null,
      umbral: regla && !regla.esRanking && regla.unidad ? valor.umbral : null,
      periodo: regla?.esRanking ? valor.periodo : null,
      puesto: regla?.esRanking ? valor.puesto : null,
    };
    this.medallas.guardar(medalla)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificaciones.success(this.data ? 'Medalla actualizada' : 'Medalla creada', 'Medallas');
          this.dialogRef.close(true);
        },
        error: (e: unknown) => {
          this.guardando = false;
          this.notificaciones.error(e instanceof Error ? e.message : 'No se pudo guardar', 'Medallas');
        },
      });
  }
}
