import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { DialogComunidadCategoriaComponent } from '../dialog-comunidad-categoria/dialog-comunidad-categoria.component';
import { DialogComunidadSubcategoriaComponent } from '../dialog-comunidad-subcategoria/dialog-comunidad-subcategoria.component';

@Component({
  standalone: false,
  selector: 'app-table-comunidades-categorias',
  templateUrl: './table-comunidades-categorias.component.html',
  styleUrls: ['./table-comunidades-categorias.component.scss'],
})
export class TableComunidadesCategoriasComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public categorias: any[] = [];

  constructor(
    private comunidadesService: IHttpComunidadesService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias(): void {
    this.comunidadesService.getCategorias().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      this.categorias = value ?? [];
    });
  }

  upsertCategoria(categoria?: any): void {
    const dialogRef = this.dialog.open(DialogComunidadCategoriaComponent, {
      width: '500px',
      data: categoria,
      disableClose: true,
    });
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok: any) => {
      if (ok) this.getCategorias();
    });
  }

  deleteCategoria(categoria: any): void {
    if (!this.notificationService.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;
    this.comunidadesService.deleteCategoria(categoria.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success('Categoría eliminada', 'Eliminada');
        this.getCategorias();
      },
    });
  }

  upsertSubcategoria(categoria: any, sub?: any): void {
    const dialogRef = this.dialog.open(DialogComunidadSubcategoriaComponent, {
      width: '500px',
      data: { categoria, sub },
      disableClose: true,
    });
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok: any) => {
      if (ok) this.getCategorias();
    });
  }

  deleteSubcategoria(sub: any): void {
    if (!this.notificationService.confirm(`¿Eliminar la sub-categoría "${sub.nombre}"?`)) return;
    this.comunidadesService.deleteSubCategoria(sub.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success('Sub-categoría eliminada', 'Eliminada');
        this.getCategorias();
      },
    });
  }
}
