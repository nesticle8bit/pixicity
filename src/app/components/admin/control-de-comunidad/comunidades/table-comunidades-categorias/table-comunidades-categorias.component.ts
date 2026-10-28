import {
  ComunidadCategoriaAdmin,
  ComunidadSubCategoriaAdmin,
} from 'src/app/models/comunidades/comunidad.model';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, inject, OnInit, viewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { concatMap, from, toArray } from 'rxjs';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { DialogComunidadCategoriaComponent } from '../dialog-comunidad-categoria/dialog-comunidad-categoria.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

/**
 * Taxonomía de comunidades: categorías y sub-categorías. El orden se cambia arrastrando; las sub-categorías se
 * agregan y renombran en línea. Lo que está en uso por alguna comunidad no se puede borrar (el API también lo impide).
 */
@Component({
  selector: 'app-table-comunidades-categorias',
  templateUrl: './table-comunidades-categorias.component.html',
  styleUrls: ['./table-comunidades-categorias.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatIcon, MatIconButton, MatTooltip, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder],
})
export class TableComunidadesCategoriasComponent implements OnInit {
  private comunidadesService = inject(IHttpComunidadesService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly nuevaSubInputs = viewChildren<ElementRef<HTMLInputElement>>('nuevaSubInput');

  categorias: ComunidadCategoriaAdmin[] = [];
  cargando = true;
  busqueda = '';
  /** Ids de las categorías contraídas (por defecto todas abiertas). */
  contraidas = new Set<number>();
  /** Sub-categoría que se está renombrando en línea. */
  editandoSubId: number | null = null;
  guardando = false;

  ngOnInit(): void {
    this.cargar();
  }

  //  Datos

  cargar(): void {
    this.comunidadesService
      .getCategoriasAdmin()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (value) => {
          this.categorias = value ?? [];
          this.cargando = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.cargando = false;
          this.cdr.markForCheck();
        },
      });
  }

  get totalSubs(): number {
    return this.categorias.reduce((n, c) => n + c.subCategorias.length, 0);
  }

  get totalComunidades(): number {
    return this.categorias.reduce((n, c) => n + c.comunidades, 0);
  }

  get sinSubs(): number {
    return this.categorias.filter((c) => c.subCategorias.length === 0).length;
  }

  //  Búsqueda (mientras se busca no se puede arrastrar: el orden visible no es el real)

  get buscando(): boolean {
    return this.busqueda.trim().length > 0;
  }

  get visibles(): ComunidadCategoriaAdmin[] {
    const q = this.normalizar(this.busqueda);
    if (!q) return this.categorias;
    return this.categorias.filter(
      (c) => this.normalizar(c.nombre).includes(q) || c.subCategorias.some((s) => this.normalizar(s.nombre).includes(q)),
    );
  }

  coincide(texto: string): boolean {
    const q = this.normalizar(this.busqueda);
    return !!q && this.normalizar(texto).includes(q);
  }

  buscar(valor: string): void {
    this.busqueda = valor;
  }

  private normalizar(texto: string): string {
    return (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }

  //  Expandir / contraer

  estaAbierta(cat: ComunidadCategoriaAdmin): boolean {
    return this.buscando || !this.contraidas.has(cat.id);
  }

  alternar(cat: ComunidadCategoriaAdmin): void {
    if (this.contraidas.has(cat.id)) this.contraidas.delete(cat.id);
    else this.contraidas.add(cat.id);
  }

  get todasContraidas(): boolean {
    return this.categorias.length > 0 && this.contraidas.size === this.categorias.length;
  }

  alternarTodas(): void {
    this.contraidas = this.todasContraidas ? new Set() : new Set(this.categorias.map((c) => c.id));
  }

  //  Orden (arrastrar y soltar)

  soltarCategoria(event: CdkDragDrop<ComunidadCategoriaAdmin[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.categorias, event.previousIndex, event.currentIndex);
    this.categorias.forEach((c, i) => (c.orden = i + 1));
    this.comunidadesService
      .reordenarCategorias(this.categorias.map((c) => c.id))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => this.cargar() });
  }

  soltarSub(cat: ComunidadCategoriaAdmin, event: CdkDragDrop<ComunidadSubCategoriaAdmin[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(cat.subCategorias, event.previousIndex, event.currentIndex);
    cat.subCategorias.forEach((s, i) => (s.orden = i + 1));
    this.comunidadesService
      .reordenarSubCategorias(cat.id, cat.subCategorias.map((s) => s.id))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => this.cargar() });
  }

  /** Mover con el teclado (alternativa accesible al arrastre). */
  moverCategoria(index: number, delta: -1 | 1): void {
    const destino = index + delta;
    if (destino < 0 || destino >= this.categorias.length) return;
    this.soltarCategoria({ previousIndex: index, currentIndex: destino } as CdkDragDrop<ComunidadCategoriaAdmin[]>);
  }

  //  Categorías

  upsertCategoria(categoria?: ComunidadCategoriaAdmin): void {
    const dialogRef = this.dialog.open(DialogComunidadCategoriaComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: categoria,
      disableClose: true,
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ok) => {
        if (ok) this.cargar();
      });
  }

  async deleteCategoria(categoria: ComunidadCategoriaAdmin): Promise<void> {
    if (categoria.comunidades > 0) return;
    const subs = categoria.subCategorias.length;
    const detalle = subs ? ` y sus ${subs} sub-categoría${subs === 1 ? '' : 's'}` : '';
    if (!await this.notificationService.confirm(`¿Eliminar la categoría "${categoria.nombre}"${detalle}?`)) return;
    this.comunidadesService
      .deleteCategoria(categoria.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.notificationService.success('Categoría eliminada', 'Eliminada');
        this.cargar();
      });
  }

  //  Sub-categorías (en línea)

  enfocarNuevaSub(cat: ComunidadCategoriaAdmin): void {
    this.contraidas.delete(cat.id);
    this.busqueda = '';
    this.cdr.detectChanges();
    this.nuevaSubInputs().find((i) => i.nativeElement.dataset['categoria'] === `${cat.id}`)?.nativeElement.focus();
  }

  /** Enter en el campo: agrega una o varias (separadas por coma) al final de la categoría. */
  agregarSubs(cat: ComunidadCategoriaAdmin, input: HTMLInputElement): void {
    const existentes = new Set(cat.subCategorias.map((s) => this.normalizar(s.nombre)));
    const nombres = [...new Set(input.value.split(',').map((n) => n.trim()).filter(Boolean))];
    const nuevos = nombres.filter((n) => !existentes.has(this.normalizar(n)));
    if (nombres.length && !nuevos.length) {
      this.notificationService.warning('Esa sub-categoría ya existe en esta categoría', 'Repetida');
      return;
    }
    if (!nuevos.length || this.guardando) return;

    this.guardando = true;
    from(nuevos)
      .pipe(
        concatMap((nombre) => this.comunidadesService.saveSubCategoria({ comunidadCategoriaId: cat.id, nombre, orden: 0 })),
        toArray(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          input.value = '';
          this.guardando = false;
          this.notificationService.success(
            nuevos.length === 1 ? `"${nuevos[0]}" agregada` : `${nuevos.length} sub-categorías agregadas`,
            'Guardado',
          );
          this.cargar();
          setTimeout(() => input.focus());
        },
        error: () => {
          this.guardando = false;
          this.cargar();
        },
      });
  }

  editarSub(sub: ComunidadSubCategoriaAdmin): void {
    this.editandoSubId = sub.id;
    this.cdr.detectChanges();
    const input = document.getElementById(`sub-edit-${sub.id}`) as HTMLInputElement | null;
    input?.focus();
    input?.select();
  }

  guardarSub(cat: ComunidadCategoriaAdmin, sub: ComunidadSubCategoriaAdmin, input: HTMLInputElement): void {
    if (this.editandoSubId !== sub.id) return; // blur después de Enter/Escape
    const nombre = input.value.trim();
    this.editandoSubId = null;
    if (!nombre || nombre === sub.nombre) return;

    const anterior = sub.nombre;
    sub.nombre = nombre;
    this.comunidadesService
      .saveSubCategoria({ id: sub.id, comunidadCategoriaId: cat.id, nombre, orden: sub.orden })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.notificationService.success('Sub-categoría renombrada', 'Guardado'),
        error: () => {
          sub.nombre = anterior;
          this.cdr.markForCheck();
        },
      });
  }

  cancelarEdicion(): void {
    this.editandoSubId = null;
  }

  async deleteSub(sub: ComunidadSubCategoriaAdmin): Promise<void> {
    if (sub.comunidades > 0) return;
    if (!await this.notificationService.confirm(`¿Eliminar la sub-categoría "${sub.nombre}"?`)) return;
    this.comunidadesService
      .deleteSubCategoria(sub.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.notificationService.success('Sub-categoría eliminada', 'Eliminada');
        this.cargar();
      });
  }

  plural(n: number, uno: string, varios: string): string {
    return `${n} ${n === 1 ? uno : varios}`;
  }
}
