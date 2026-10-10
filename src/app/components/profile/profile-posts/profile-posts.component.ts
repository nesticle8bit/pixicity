import { Subscription } from 'rxjs';
import { PerfilRef, SIN_PERFIL } from 'src/app/models/seguridad/seguridad-vm.model';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-profile-posts',
    templateUrl: './profile-posts.component.html',
    styleUrls: ['./profile-posts.component.scss'],
    imports: [
        NgClass,
        RouterLink,
        MatPaginator,
        TimeAgoPipe,
    ],
})
export class ProfilePostsComponent implements OnInit {
  paginationService = inject(PaginationService);
  private postService = inject(IHttpPostsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly destroyRef = inject(DestroyRef);
  private cargaGetPosts?: Subscription;

  private _user: PerfilRef = SIN_PERFIL;

  @Input() set user(value: PerfilRef | null) {
    this._user = value ?? SIN_PERFIL;

    // Antes de ngOnInit no se carga: ngOnInit lo hace con la página del ?page= (si no, se pedían dos páginas a
    // la vez y podía quedar la equivocada). Después sí: cambiar de perfil recarga.
    if (value?.id && this.iniciado) {
      this.getPosts();
    }
  }

  get user(): PerfilRef {
    return this._user;
  }

  public posts: any[] = [];
  public totalCount: number = 0;
  public pageIndex: number = 0;

  private iniciado = false;

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
  }

  ngOnInit(): void {
    this.iniciado = true;
    // Los posts viejos de un perfil no tenian ningun enlace entrante: la
    // pagina pasa a vivir en ?page= y el paginador navega en vez de recargar.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const page = Number(params.get('page')) || 1;
        this.pageIndex = Math.max(0, page - 1);
        this.paginationService.change({
          pageIndex: this.pageIndex,
          pageSize: this.paginationService.pageCount,
          length: this.totalCount,
        });

        if (this.user.id) {
          this.getPosts();
        }
      });
  }

  queryParamsPara(pagina: number): any {
    return pagina <= 1 ? { page: null } : { page: pagina };
  }

  get totalPaginas(): number[] {
    const total = Math.ceil(this.totalCount / (this.paginationService.pageCount || 10));
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  getPosts(): void {
    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.

    this.cargaGetPosts?.unsubscribe();

    this.cargaGetPosts = this.postService
      .getPostsByUserId(this.user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.posts = response.data;
        this.totalCount = response.pagination.totalCount;
      });
  }

  pageChange(event: PageEvent): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.queryParamsPara(event.pageIndex + 1),
      queryParamsHandling: 'merge',
    });
  }
}
