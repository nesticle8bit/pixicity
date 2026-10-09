import { IHttpFavoritosService } from 'src/app/services/interfaces/httpFavoritos.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { AdsByTypeComponent } from '../../ads/ads-by-type/ads-by-type.component';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-favoritos',
    templateUrl: './favoritos.component.html',
    styleUrls: ['./favoritos.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, NgClass, RouterLink, MatTooltip, MatPaginator, AdsByTypeComponent, TimeAgoPipe]
})
export class FavoritosComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  favoritosService = inject(IHttpFavoritosService);
  paginationService = inject(PaginationService);
  private httpGeneral = inject(IHttpGeneralService);
  private formBuilder = inject(FormBuilder);

  private readonly destroyRef = inject(DestroyRef);

  public favoritos: any[] = [];
  public categorias: any[] = [];
  public totalCount: number = 0;
  public formGroup!: FormGroup;

  constructor() {
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
    this.httpGeneral.getFavoritosByUser(this.formGroup?.value?.search, categoriaId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.favoritos = response.favoritos;

      if (this.categorias?.length <= 0) {
        this.categorias = response.categorias;
      }

      this.totalCount = response.pagination.totalCount;
    });
  }

  deleteFavorito(favorito: any): void {
    this.favoritosService.deleteFavorito(favorito.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
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
