import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { SEOService } from 'src/app/services/shared/seo.service';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

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
    private router: Router,
    private title: Title,
    private seoService: SEOService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });

    // Cada busqueda genera una URL propia: indexarlas es contenido pobre
    // infinito que se come el presupuesto de rastreo.
    this.seoService.setSEO({
      title: 'Buscador',
      description: 'Buscá posts, usuarios y comunidades en Taringa.',
      type: 'website',
      imageURL: '',
      tags: [],
      noIndex: true,
    });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });

    this.searchFormGroup = this.formBuilder.group({
      search: [''],
      searchType: ['titulo'],
      categoria: undefined,
      autor: '',
    });

    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((route) => {
      if (route?.get('query')) {
        this.isSearch = true;
        this.searchFormGroup.patchValue({
          search: route?.get('query'),
          searchType: 'titulo',
        });
      }

      if (route?.get('categoria')) {
        this.searchFormGroup.patchValue({
          categoria: route?.get('categoria'),
        });
      }
    });
  }

  ngOnInit(): void {
    forkJoin([this.parametrosService.getCategoriasDropdown()]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response) => {
        this.categorias = response[0];
        this.searchPosts();
      }
    );
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

    this.postService.searchPosts(search).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.posts = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.searchPosts();
  }
}
