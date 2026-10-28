import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTooltip } from '@angular/material/tooltip';
import { AdminFiltro, AdminFiltrosConfig } from 'src/app/models/admin/admin-filtro.model';
import { AnuncioAdmin, AnuncioOpciones, ctr } from 'src/app/models/web/anuncio.model';
import { IHttpAnunciosService } from 'src/app/services/interfaces/httpAnuncios.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { AdminFiltrosComponent } from '../../../shared/admin-filtros/admin-filtros.component';
import { DialogAnuncioComponent, DialogAnuncioData } from '../dialog-anuncio/dialog-anuncio.component';
import { DialogAnuncioEstadisticasComponent } from '../dialog-anuncio-estadisticas/dialog-anuncio-estadisticas.component';

const TIPOS: Record<string, string> = { html: 'HTML', imagen: 'Imagen', componente: 'Componente' };
const DISPOSITIVOS: Record<string, string> = { movil: 'Celular', escritorio: 'Escritorio' };
const AUDIENCIAS: Record<string, string> = { anonimos: 'Sin sesión', registrados: 'Con sesión' };

@Component({
  selector: 'app-table-anuncios',
  templateUrl: './table-anuncios.component.html',
  styleUrls: ['./table-anuncios.component.scss'],
  imports: [AdminFiltrosComponent, MatPaginator, MatMenu, MatMenuItem, MatMenuTrigger, MatIcon, MatTooltip, DatePipe, DecimalPipe],
})
export class TableAnunciosComponent implements OnInit {
  paginationService = inject(PaginationService);
  private anunciosService = inject(IHttpAnunciosService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly ctr = ctr;
  readonly tipos = TIPOS;

  public anuncios: AnuncioAdmin[] = [];
  public totalCount = 0;
  public cargando = false;
  public filtro: AdminFiltro = {};
  public opciones: AnuncioOpciones | null = null;
  private nombresUbicacion = new Map<string, string>();

  public readonly filtrosConfig: AdminFiltrosConfig = {
    placeholder: 'Buscar anuncios...',
    fechas: true,
    orden: true,
    tipoLabel: 'Estado',
    tipos: [
      { valor: 'activos', label: 'Mostrándose ahora' },
      { valor: 'programados', label: 'Programados' },
      { valor: 'vencidos', label: 'Vencidos' },
      { valor: 'inactivos', label: 'Desactivados' },
    ],
  };

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.anunciosService.getOpciones().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((opciones) => {
      this.opciones = opciones;
      this.nombresUbicacion = new Map(opciones.ubicaciones.map((u) => [u.id, u.nombre]));
    });
    this.getAnuncios();
  }

  getAnuncios(): void {
    this.cargando = true;
    this.anunciosService
      .getAnunciosAdmin(this.filtro)
      .pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.anuncios = response.data ?? [];
        this.totalCount = response.pagination.totalCount;
      });
  }

  aplicarFiltro(filtro: AdminFiltro): void {
    this.filtro = filtro;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getAnuncios();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getAnuncios();
  }

  ubicacion(id: string): string {
    return this.nombresUbicacion.get(id) ?? id;
  }

  /** Resumen corto de la segmentación para la tabla ("Todo el sitio" si no tiene ninguna). */
  segmentacion(a: AnuncioAdmin): string[] {
    const partes: string[] = [];
    if (a.categoriaIds.length) partes.push(`${a.categoriaIds.length} categoría${a.categoriaIds.length > 1 ? 's' : ''}`);
    if (a.comunidadIds.length) partes.push(`${a.comunidadIds.length} comunidad${a.comunidadIds.length > 1 ? 'es' : ''}`);
    if (DISPOSITIVOS[a.dispositivo]) partes.push(DISPOSITIVOS[a.dispositivo]);
    if (AUDIENCIAS[a.audiencia]) partes.push(AUDIENCIAS[a.audiencia]);
    return partes.length ? partes : ['Todo el sitio'];
  }

  /** Estado real: activo pero fuera de fechas no se está mostrando. */
  estado(a: AnuncioAdmin): { texto: string; clase: string } {
    const ahora = Date.now();
    if (!a.activo) return { texto: 'Desactivado', clase: 'bg-secondary' };
    if (a.fechaInicio && Date.parse(a.fechaInicio) > ahora) return { texto: 'Programado', clase: 'bg-info' };
    if (a.fechaFin && Date.parse(a.fechaFin) < ahora) return { texto: 'Vencido', clase: 'bg-warning' };
    return { texto: 'Activo', clase: 'bg-success' };
  }

  abrir(anuncio: AnuncioAdmin | null = null): void {
    if (!this.opciones) return;
    const data: DialogAnuncioData = { anuncio, opciones: this.opciones };
    this.dialog
      .open(DialogAnuncioComponent, { width: '900px', maxWidth: '96vw', data, disableClose: true })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((guardado) => guardado && this.getAnuncios());
  }

  verEstadisticas(anuncio: AnuncioAdmin): void {
    this.dialog.open(DialogAnuncioEstadisticasComponent, { width: '720px', maxWidth: '96vw', data: anuncio });
  }

  alternarActivo(anuncio: AnuncioAdmin): void {
    this.anunciosService
      .cambiarActivo(anuncio.id, !anuncio.activo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        anuncio.activo = !anuncio.activo;
        this.notificationService.success(anuncio.activo ? 'El anuncio se vuelve a mostrar' : 'El anuncio dejó de mostrarse', 'Publicidad');
      });
  }

  async eliminar(anuncio: AnuncioAdmin): Promise<void> {
    if (!await this.notificationService.confirm(`¿Eliminar el anuncio "${anuncio.nombre}"? Sus estadísticas también dejan de verse.`)) return;
    this.anunciosService
      .deleteAnuncio(anuncio.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.notificationService.success('Anuncio eliminado', 'Publicidad');
        this.getAnuncios();
      });
  }
}
