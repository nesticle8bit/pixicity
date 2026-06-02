import { IHttpFavoritosService } from 'src/app/services/interfaces/httpFavoritos.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-favoritos',
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.scss']
})
export class FavoritosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public favoritos: any[] = [];
  public categorias: any[] = [];
  public totalCount: number = 0;
  public formGroup!: FormGroup;

  constructor(
    private displayService: DisplayComponentService,
    public favoritosService: IHttpFavoritosService,
    public paginationService: PaginationService,
    private httpGeneral: IHttpGeneralService,
    private formBuilder: FormBuilder
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: ''
    });
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      search: ['', Validators.required]
    });

    this.getFavoritos(0);
  }

  getFavoritos(categoriaId: number): void {
    this.httpGeneral.getFavoritosByUser(this.formGroup?.value?.search, categoriaId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.favoritos = response.favoritos;

      if (this.categorias?.length <= 0) {
        this.categorias = response.categorias;
      }

      this.totalCount = response.pagination.totalCount;
    });
  }

  deleteFavorito(favorito: any): void {
    this.favoritosService.deleteFavorito(favorito.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      if (response) {
        favorito.deleted = response.eliminado;
      }
    });
  }

  filterByCategory(categoria: any): void {
    if (!categoria) {
      return;
    }

    this.getFavoritos(categoria.categoria.id);
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getFavoritos(0);
  }
}
