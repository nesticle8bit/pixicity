import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-borradores',
  templateUrl: './borradores.component.html',
  styleUrls: ['./borradores.component.scss'],
})
export class BorradoresComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public borradores: any[] = [];
  public categorias: any[] = [];
  public totalCount: number = 0;
  public formGroup: FormGroup;

  constructor(
    private displayService: DisplayComponentService,
    public paginationService: PaginationService,
    private postService: IHttpPostsService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });

    this.formGroup = this.formBuilder.group({
      search: '',
    });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: ''
    });
  }

  ngOnInit(): void {
    this.getBorradores(0);
  }

  getBorradores(categoriaId: number): void {
    this.postService
      .getBorradores(this.formGroup?.value?.search, categoriaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (this.categorias?.length <= 0) {
          this.categorias = response.categorias;
        }

        this.borradores = response.data;
        this.totalCount = response.pagination.totalCount;
      });
  }

  filterByCategory(categoria: any): void {
    if (!categoria) {
      return;
    }

    this.getBorradores(categoria.categoria.id);
  }

  deleteBorrador(borrador: any): void {
    const accion = !borrador.eliminado ? 'eliminar' : 'recuperar';

    if (!this.notificationService.confirm(`¿Seguro que deseas ${accion} este borrador?`)) {
      return;
    }

    this.postService
      .deletePost(borrador.id, '')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: boolean) => {
        const titulo = !borrador.eliminado ? 'Eliminado' : 'Recuperado';
        const texto = `El post ha sido ${accion}do correctamente, ahora nadie lo podrá visualizar`;
        this.notificationService.success(texto, titulo);
        borrador.eliminado = !borrador.eliminado;
      });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getBorradores(0);
  }
}
