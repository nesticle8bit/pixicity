import { Component, DestroyRef, inject, OnInit, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject } from 'rxjs';
import { AdminFiltro, AdminFiltrosConfig, contarFiltrosAvanzados } from 'src/app/models/admin/admin-filtro.model';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

/**
 * Barra de búsqueda de las tablas del panel: buscador (busca en todos los campos de texto de la tabla) y un botón
 * "Filtros" que despliega los filtros avanzados que la tabla declare en `config`. Emite el filtro completo en cada
 * cambio; el texto con una pausa para no consultar en cada tecla.
 */
@Component({
    selector: 'app-admin-filtros',
    templateUrl: './admin-filtros.component.html',
    styleUrls: ['./admin-filtros.component.scss'],
    imports: [FormsModule, DecimalPipe],
})
export class AdminFiltrosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly texto$ = new Subject<string>();
  private readonly usuario$ = new Subject<string>();

  readonly config = input<AdminFiltrosConfig>({});
  /** Total de resultados con el filtro actual (se muestra a la derecha). */
  readonly total = input<number | null>(null);
  readonly cargando = input(false);

  readonly cambio = output<AdminFiltro>();

  public filtro: AdminFiltro = {};
  public abierto = false;

  ngOnInit(): void {
    // Se compara con el filtro actual (no con el último valor tecleado): tras "Limpiar" el mismo texto vuelve a aplicar.
    this.texto$
      .pipe(debounceTime(350), takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => {
        if (q !== (this.filtro.q ?? '')) this.set('q', q);
      });

    this.usuario$
      .pipe(debounceTime(350), takeUntilDestroyed(this.destroyRef))
      .subscribe((usuario) => {
        if (usuario !== (this.filtro.usuario ?? '')) this.set('usuario', usuario);
      });
  }

  get tieneAvanzados(): boolean {
    const c = this.config();
    return !!(c.fechas || c.estado || c.orden || c.usuario || c.categorias?.length || c.tipos?.length);
  }

  get avanzadosActivos(): number {
    return contarFiltrosAvanzados(this.filtro);
  }

  get hayFiltros(): boolean {
    return !!this.filtro.q?.trim() || this.avanzadosActivos > 0;
  }

  onTexto(q: string): void {
    this.texto$.next(q.trim());
  }

  /** Enter en el buscador: aplica ya, sin esperar la pausa. */
  buscarYa(q: string): void {
    this.filtro = { ...this.filtro, q: q.trim() };
    this.emitir();
  }

  set<K extends keyof AdminFiltro>(campo: K, valor: AdminFiltro[K]): void {
    this.filtro = { ...this.filtro, [campo]: valor };
    this.emitir();
  }

  /** Usuario (texto libre): con pausa, igual que el buscador. */
  onUsuario(valor: string): void {
    this.usuario$.next(valor.trim());
  }

  limpiar(): void {
    this.filtro = {};
    this.emitir();
  }

  private emitir(): void {
    this.cambio.emit({ ...this.filtro });
  }
}
