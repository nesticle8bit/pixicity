import { Component, ContentChild, DestroyRef, inject, Input, OnInit, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

/** Operaciones de un tipo de denuncia de comentarios (posts, shouts, comunidades). */
export interface FuenteDenuncias {
  listar(page: number, pageCount: number, soloPendientes: boolean): Observable<any>;
  resolver(denunciaId: number): Observable<boolean>;
  eliminar(denunciaId: number): Observable<any>;
  borrarComentario(comentarioId: number): Observable<any>;
}

/**
 * Tabla de denuncias de comentarios. La celda de origen (post, shout, tema) se proyecta con
 * `<ng-template #origen let-comentario>`.
 */
@Component({
  standalone: false,
  selector: 'app-table-denuncias',
  templateUrl: './table-denuncias.component.html',
  styleUrls: ['./table-denuncias.component.scss'],
})
export class TableDenunciasComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) fuente!: FuenteDenuncias;
  @Input() columnaOrigen: string = 'Origen';
  @Input() mensajeVacio: string = 'No hay denuncias de comentarios.';
  /** Propiedad del comentario que contiene el texto. */
  @Input() campoTexto: string = 'contenido';

  @ContentChild('origen') origenTpl?: TemplateRef<any>;

  public denuncias: any[] = [];
  public totalCount: number = 0;
  public pendientes: number = 0;
  public soloPendientes: boolean = true;

  constructor(
    public paginationService: PaginationService,
    private notificationService: NotificationService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getDenuncias();
  }

  getDenuncias(): void {
    this.fuente
      .listar(this.paginationService.page, this.paginationService.pageCount, this.soloPendientes)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.denuncias = response?.data ?? [];
        this.totalCount = response?.pagination?.totalCount ?? 0;
        this.pendientes = response?.pendientes ?? 0;
      });
  }

  cambiarFiltro(soloPendientes: boolean): void {
    if (this.soloPendientes === soloPendientes) return;
    this.soloPendientes = soloPendientes;
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getDenuncias();
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getDenuncias();
  }

  borrarComentario(denuncia: any): void {
    if (!denuncia.comentario?.id) return;
    if (!this.notificationService.confirm('¿Borrar el comentario denunciado? Esta acción no se puede deshacer.')) return;
    this.fuente.borrarComentario(denuncia.comentario.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        denuncia.comentario.eliminado = true;
        this.notificationService.success('Comentario borrado', 'Moderación');
      },
    });
  }

  resolver(denuncia: any): void {
    this.fuente.resolver(denuncia.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (resuelto) => {
        denuncia.resuelto = resuelto;
        this.notificationService.success(resuelto ? 'Denuncia marcada como resuelta' : 'Denuncia reabierta', 'Denuncias');
      },
    });
  }

  eliminar(denuncia: any): void {
    if (!this.notificationService.confirm('¿Eliminar esta denuncia del listado?')) return;
    this.fuente.eliminar(denuncia.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success('Denuncia eliminada', 'Denuncias');
        this.getDenuncias();
      },
    });
  }
}
