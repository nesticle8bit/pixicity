import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  public isSearch: boolean = false;
  public searchFormGroup: FormGroup;
  public posts: any[] = [];
  public totalCount: number = 0;
  public categorias: any[] = [];

  constructor(
    private parametrosService: IHttpParametrosService,
    private displayService: DisplayComponentService,
    public paginationService: PaginationService,
    private postService: IHttpPostsService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
    });

    this.searchFormGroup = this.formBuilder.group({
      search: [''],
      searchType: ['titulo'],
      categoria: undefined,
      autor: ''
    });

    this.activatedRoute.paramMap.subscribe((route: any) => {
      if (route?.params?.query) {
        this.isSearch = true;
        this.searchFormGroup.patchValue({
          search: route?.params?.query,
          searchType: 'titulo',
        });
      }

      if (route?.params?.categoria) {
        this.searchFormGroup.patchValue({
          categoria: route?.params?.categoria,
        });
      }
    });
  }

  ngOnInit(): void {
    forkJoin([this.parametrosService.getCategoriasDropdown()]).subscribe((response: any) => {
      this.categorias = response[0];
      this.searchPosts();
    });
  }

  search(): void {
    const query = this.searchFormGroup.value.search;
    let categoria = this.searchFormGroup.value.categoria;

    if (!query) {
      return;
    }

    categoria = categoria ? `/${categoria}` : '';

    if (this.router.url === `/buscar/posts/${query}${categoria}`) {
      this.searchPosts();
      return;
    }

    this.router.navigate([`/buscar/posts/${query}${categoria}`]);
  }

  searchPosts(): void {
    const search = Object.assign({}, this.searchFormGroup.value);

    if (search.categoria) {
      const categoria = this.categorias.find(
        (categoria: any) => categoria.seo === search.categoria
      );

      if (categoria) {
        search['categoriaId'] = categoria.id;
      }
    }

    this.postService.searchPosts(search).subscribe((response: any) => {
      this.posts = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.searchPosts();
  }
}
