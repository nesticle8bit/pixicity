import { IHttpFavoritosService } from 'src/app/services/interfaces/httpFavoritos.interface';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.scss']
})
export class FavoritosComponent implements OnInit {
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
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
    });
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      search: ['', Validators.required]
    });

    this.getFavoritos(0);
  }

  getFavoritos(categoriaId: number): void {
    this.httpGeneral.getFavoritosByUser(this.formGroup?.value?.search, categoriaId).subscribe((response: any) => {
      if (response?.favoritos) {
        response.favoritos = response.favoritos.map((fav: any) => {
          fav.post.url = fav.post.titulo.toLowerCase().replace(/\s/g, '-');
          return fav;
        });
      }

      this.favoritos = response.favoritos;

      if (this.categorias?.length <= 0) {
        this.categorias = response.categorias;
      }

      this.totalCount = response.pagination.totalCount;
    });
  }

  deleteFavorito(favorito: any): void {
    this.favoritosService.deleteFavorito(favorito.id).subscribe((response: any) => {
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
