import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { IHttpAnunciosService } from 'src/app/services/interfaces/httpAnuncios.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { AnuncioAdmin, AnuncioGuardar, AnuncioOpciones, OpcionAnuncio } from 'src/app/models/web/anuncio.model';
import { COMPONENTES_ANUNCIO } from '../../../../ads/anuncios';
import { ContenidoSeoPipe } from '../../../../../shared/pipes/contenidoSeo.pipe';

export interface DialogAnuncioData {
  anuncio: AnuncioAdmin | null;
  opciones: AnuncioOpciones;
}

/** "2026-10-25T14:30" (hora local, lo que usa <input type="datetime-local">) a partir de una fecha UTC del API. */
function aLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

/** Lo contrario: la hora local del input pasa al API en UTC. */
function aUtc(local: string | null | undefined): string | null {
  return local ? new Date(local).toISOString() : null;
}

@Component({
  selector: 'app-dialog-anuncio',
  templateUrl: './dialog-anuncio.component.html',
  styleUrls: ['./dialog-anuncio.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatSlideToggle,
    ContenidoSeoPipe,
  ],
})
export class DialogAnuncioComponent {
  private formBuilder = inject(FormBuilder);
  private anunciosService = inject(IHttpAnunciosService);
  private notificationService = inject(NotificationService);
  private dialogRef = inject(MatDialogRef<DialogAnuncioComponent>);
  private readonly destroyRef = inject(DestroyRef);

  readonly data = inject<DialogAnuncioData>(MAT_DIALOG_DATA);
  readonly componentes = COMPONENTES_ANUNCIO;
  readonly editando = !!this.data.anuncio;
  readonly guardando = signal(false);

  readonly filtroCategorias = signal('');
  readonly filtroComunidades = signal('');
  readonly categoriasVisibles = computed(() => this.filtrar(this.data.opciones.categorias, this.filtroCategorias()));
  readonly comunidadesVisibles = computed(() => this.filtrar(this.data.opciones.comunidades, this.filtroComunidades()));

  readonly form = this.formBuilder.nonNullable.group({
    nombre: [this.data.anuncio?.nombre ?? '', [Validators.required, Validators.maxLength(100)]],
    tipo: [this.data.anuncio?.tipo ?? ('html' as AnuncioGuardar['tipo'])],
    html: [this.data.anuncio?.html ?? ''],
    imagenUrl: [this.data.anuncio?.imagenUrl ?? ''],
    enlaceUrl: [this.data.anuncio?.enlaceUrl ?? ''],
    textoAlternativo: [this.data.anuncio?.textoAlternativo ?? ''],
    ancho: [this.data.anuncio?.ancho ?? (null as number | null)],
    alto: [this.data.anuncio?.alto ?? (null as number | null)],
    componente: [this.data.anuncio?.componente ?? this.componentes[0].id],
    variante: [this.data.anuncio?.variante ?? 'cuadrado'],
    dispositivo: [this.data.anuncio?.dispositivo ?? ('todos' as AnuncioGuardar['dispositivo'])],
    audiencia: [this.data.anuncio?.audiencia ?? ('todos' as AnuncioGuardar['audiencia'])],
    fechaInicio: [aLocal(this.data.anuncio?.fechaInicio)],
    fechaFin: [aLocal(this.data.anuncio?.fechaFin)],
    peso: [this.data.anuncio?.peso ?? 1, [Validators.min(1), Validators.max(10)]],
    activo: [this.data.anuncio?.activo ?? true],
  });

  // Las listas se manejan aparte del formulario: son casillas.
  readonly ubicaciones = signal(new Set(this.data.anuncio?.ubicaciones ?? []));
  readonly categorias = signal(new Set((this.data.anuncio?.categoriaIds ?? []).map(String)));
  readonly comunidades = signal(new Set((this.data.anuncio?.comunidadIds ?? []).map(String)));

  readonly tipo = signal(this.form.controls.tipo.value);

  constructor() {
    this.form.controls.tipo.valueChanges.pipe(takeUntilDestroyed()).subscribe((t) => this.tipo.set(t));
  }

  alternar(lista: 'ubicaciones' | 'categorias' | 'comunidades', id: string): void {
    this[lista].update((actual) => {
      const nueva = new Set(actual);
      nueva.has(id) ? nueva.delete(id) : nueva.add(id);
      return nueva;
    });
  }

  /** Lo que falta para poder guardar, para mostrarlo junto al botón (el API igual lo valida). */
  get faltante(): string | null {
    const v = this.form.getRawValue();
    if (!v.nombre.trim()) return 'Falta el nombre';
    if (v.tipo === 'html' && !v.html.trim()) return 'Falta el HTML';
    if (v.tipo === 'imagen' && !/^https?:\/\//i.test(v.imagenUrl.trim())) return 'La imagen tiene que ser una URL http(s)';
    if (!this.ubicaciones().size) return 'Elige al menos una ubicación';
    if (v.fechaInicio && v.fechaFin && v.fechaFin < v.fechaInicio) return 'La fecha de fin es anterior a la de inicio';
    return null;
  }

  guardar(): void {
    if (this.faltante || this.form.invalid) return;
    const v = this.form.getRawValue();
    const anuncio: AnuncioGuardar = {
      id: this.data.anuncio?.id,
      nombre: v.nombre.trim(),
      tipo: v.tipo,
      html: v.html,
      imagenUrl: v.imagenUrl,
      enlaceUrl: v.enlaceUrl,
      textoAlternativo: v.textoAlternativo,
      ancho: v.ancho || null,
      alto: v.alto || null,
      componente: v.componente,
      variante: v.variante,
      ubicaciones: [...this.ubicaciones()],
      categoriaIds: [...this.categorias()].map(Number),
      comunidadIds: [...this.comunidades()].map(Number),
      dispositivo: v.dispositivo,
      audiencia: v.audiencia,
      fechaInicio: aUtc(v.fechaInicio),
      fechaFin: aUtc(v.fechaFin),
      peso: v.peso,
      activo: v.activo,
    };

    this.guardando.set(true);
    const pedido: Observable<unknown> = this.editando ? this.anunciosService.updateAnuncio(anuncio) : this.anunciosService.saveAnuncio(anuncio);
    pedido.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success(this.editando ? 'Anuncio actualizado' : 'Anuncio creado', 'Publicidad');
        this.dialogRef.close(true);
      },
      error: () => this.guardando.set(false),
    });
  }

  private filtrar(opciones: OpcionAnuncio[], texto: string): OpcionAnuncio[] {
    const t = texto.trim().toLowerCase();
    return t ? opciones.filter((o) => o.nombre.toLowerCase().includes(t)) : opciones;
  }
}
