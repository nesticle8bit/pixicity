import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.scss']
})
export class FavoritosComponent implements OnInit {
  public favoritos: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private httpGeneral: IHttpGeneralService
  ) { }

  ngOnInit(): void {
    this.getFavoritos();
  }

  getFavoritos(): void {
    this.httpGeneral.getFavoritosByUser().subscribe((response: any) => {
      this.favoritos = response.favoritos;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getFavoritos();
  }
}
