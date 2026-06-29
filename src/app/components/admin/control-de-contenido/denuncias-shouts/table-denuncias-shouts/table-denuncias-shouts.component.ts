import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-table-denuncias-shouts',
  templateUrl: './table-denuncias-shouts.component.html',
  styleUrls: ['./table-denuncias-shouts.component.scss'],
})
export class TableDenunciasShoutsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public denuncias: any[] = [];
  public totalCount: number = 0;
  public pendientes: number = 0;
  public soloPendientes: boolean = true;

  constructor(
    public paginationService: PaginationService,
    private perfilService: IHttpPerfilService,
    private notificationService: NotificationService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getDenuncias();
  }

  getDenuncias(): void {
    this.perfilService
      .getDenunciasShoutComentarios(this.paginationService.page, this.paginationService.pageCount, this.soloPendientes)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
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

  resolver(denuncia: any): void {
    this.perfilService.resolverDenunciaShoutComentario(denuncia.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (resuelto: any) => {
        denuncia.resuelto = resuelto;
        this.notificationService.success(resuelto ? 'Denuncia marcada como resuelta' : 'Denuncia reabierta', 'Denuncias');
      },
    });
  }

  eliminar(denuncia: any): void {
    if (!this.notificationService.confirm('¿Eliminar esta denuncia del listado?')) return;
    this.perfilService.eliminarDenunciaShoutComentario(denuncia.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success('Denuncia eliminada', 'Denuncias');
        this.getDenuncias();
      },
    });
  }

  borrarComentario(denuncia: any): void {
    if (!denuncia.comentario?.id) return;
    if (!this.notificationService.confirm('¿Borrar el comentario denunciado? Esta acción no se puede deshacer.')) return;
    this.perfilService.deleteShoutComentario(denuncia.comentario.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        denuncia.comentario.eliminado = true;
        this.notificationService.success('Comentario borrado', 'Moderación');
      },
    });
  }
}
