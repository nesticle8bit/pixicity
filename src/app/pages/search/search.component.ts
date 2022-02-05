import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
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
    public paginationService: PaginationService,
    private postService: IHttpPostsService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.searchFormGroup = this.formBuilder.group({
      search: [''],
      searchType: ['titulo'],
      categoriaId: undefined
    });

    this.activatedRoute.paramMap.subscribe((route: any) => {
      if(route?.params?.query) {
        this.isSearch = true;
        this.searchFormGroup.patchValue({
          search: route?.params?.query,
          searchType: ['titulo']
        });

        this.searchPosts();
      }
    });
  }

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias(): void {
    this.parametrosService.getCategoriasDropdown().subscribe((value: any) => {
      this.categorias = value;
    });
  }

  search(): void {
    const query = this.searchFormGroup.value.search;

    if (!query) {
      return;
    }

    this.router.navigate([`/buscar/posts/${query}`]);
  }

  searchPosts(): void {
    const search = Object.assign({}, this.searchFormGroup.value);

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
