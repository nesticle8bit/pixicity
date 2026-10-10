import { ComunidadCategoria, ComunidadSubCategoria } from 'src/app/models/comunidades/comunidad.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { DialogComunidadCategoriaComponent } from '../dialog-comunidad-categoria/dialog-comunidad-categoria.component';
import { DialogComunidadSubcategoriaComponent } from '../dialog-comunidad-subcategoria/dialog-comunidad-subcategoria.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-table-comunidades-categorias',
    templateUrl: './table-comunidades-categorias.component.html',
    styleUrls: ['./table-comunidades-categorias.component.scss'],
    imports: [
        MatButton,
        MatIcon,
        MatIconButton,
        MatTooltip,
    ],
})
export class TableComunidadesCategoriasComponent implements OnInit {
  private comunidadesService = inject(IHttpComunidadesService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  private readonly destroyRef = inject(DestroyRef);

  public categorias: ComunidadCategoria[] = [];

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias(): void {
    this.comunidadesService.getCategorias().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.categorias = value ?? [];
    });
  }

  upsertCategoria(categoria?: ComunidadCategoria): void {
    const dialogRef = this.dialog.open(DialogComunidadCategoriaComponent, {
      width: '500px',
      data: categoria,
      disableClose: true,
    });
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok) => {
      if (ok) this.getCategorias();
    });
  }

  deleteCategoria(categoria: ComunidadCategoria): void {
    if (!this.notificationService.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;
    this.comunidadesService.deleteCategoria(categoria.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success('Categoría eliminada', 'Eliminada');
        this.getCategorias();
      },
    });
  }

  upsertSubcategoria(categoria: ComunidadCategoria, sub?: ComunidadSubCategoria): void {
    const dialogRef = this.dialog.open(DialogComunidadSubcategoriaComponent, {
      width: '500px',
      data: { categoria, sub },
      disableClose: true,
    });
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok) => {
      if (ok) this.getCategorias();
    });
  }

  deleteSubcategoria(sub: ComunidadSubCategoria): void {
    if (!this.notificationService.confirm(`¿Eliminar la sub-categoría "${sub.nombre}"?`)) return;
    this.comunidadesService.deleteSubCategoria(sub.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success('Sub-categoría eliminada', 'Eliminada');
        this.getCategorias();
      },
    });
  }
}
