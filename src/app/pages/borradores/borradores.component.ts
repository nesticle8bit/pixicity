import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-borradores',
  templateUrl: './borradores.component.html',
  styleUrls: ['./borradores.component.scss'],
})
export class BorradoresComponent implements OnInit {
  public borradores: any[] = [];
  public categorias: any[] = [];
  public totalCount: number = 0;
  public formGroup: FormGroup;

  constructor(
    public paginationService: PaginationService,
    private postService: IHttpPostsService,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      search: ''
    });
  }

  ngOnInit(): void {
    this.getBorradores(0);
  }

  getBorradores(categoriaId: number): void {
    this.postService.getBorradores(this.formGroup?.value?.search, categoriaId).subscribe((response: any) => {
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
    console.log(borrador);
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getBorradores(0);
  }
}
