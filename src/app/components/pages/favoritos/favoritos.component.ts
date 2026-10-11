import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, map, Subject, switchMap, tap } from 'rxjs';
import { FavoritoPostLista } from 'src/app/models/posts/post-vm.model';
import { ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';
import { IHttpFavoritosService } from 'src/app/services/interfaces/httpFavoritos.interface';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { AdsByTypeComponent } from '../../ads/ads-by-type/ads-by-type.component';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { CargandoComponent } from '../../shared/cargando/cargando.component';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

type Pestana = 'posts' | 'shouts';
type CategoriaConteo = { categoria: { id: number; icono: string; nombre: string }; count: number };

/** Un favorito de la lista: `quitado` deja la fila en su lugar con "Deshacer" hasta recargar. */
type Fila<T> = T & { quitado?: boolean; procesando?: boolean };

const POR_PAGINA = 10;

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.scss'],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatTooltip,
    MatPaginator,
    AdsByTypeComponent,
    UserAvatarComponent,
    CargandoComponent,
    TimeAgoPipe,
  ],
})
export class FavoritosComponent implements OnInit {
  private readonly displayService = inject(DisplayComponentService);
  private readonly favoritosService = inject(IHttpFavoritosService);
  private readonly httpGeneral = inject(IHttpGeneralService);
  private readonly perfilService = inject(IHttpPerfilService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly porPagina = POR_PAGINA;
  readonly busqueda = new FormControl('', { nonNullable: true });

  readonly pestana = signal<Pestana>('posts');

  // Posts
  readonly posts = signal<Fila<FavoritoPostLista>[]>([]);
  readonly totalPosts = signal<number | null>(null);
  readonly categorias = signal<CategoriaConteo[]>([]);
  readonly categoriaId = signal(0);
  readonly paginaPosts = signal(0);
  readonly cargandoPosts = signal(true);
  readonly totalGeneralPosts = computed(() => this.categorias().reduce((s, c) => s + c.count, 0));

  // Shouts
  readonly shouts = signal<Fila<ShoutViewModel>[]>([]);
  readonly totalShouts = signal<number | null>(null);
  readonly paginaShouts = signal(0);
  readonly cargandoShouts = signal(true);

  private readonly pedirPosts = new Subject<void>();
  private readonly pedirShouts = new Subject<void>();

  constructor() {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });

    // switchMap: si llega una consulta nueva (otra página, categoría o búsqueda), descarta la anterior.
    this.pedirPosts
      .pipe(
        tap(() => this.cargandoPosts.set(true)),
        switchMap(() =>
          this.httpGeneral
            .getFavoritosByUser(this.busqueda.value.trim(), this.categoriaId(), this.paginaPosts() + 1, POR_PAGINA)
            .pipe(catchError(() => (this.cargandoPosts.set(false), EMPTY))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((r) => {
        this.posts.set(r.favoritos);
        this.categorias.set(r.categorias);
        this.totalPosts.set(r.pagination.totalCount);
        this.cargandoPosts.set(false);
      });

    this.pedirShouts
      .pipe(
        tap(() => this.cargandoShouts.set(true)),
        switchMap(() =>
          this.perfilService
            .getShoutsFavoritos(this.paginaShouts() + 1, POR_PAGINA)
            .pipe(catchError(() => (this.cargandoShouts.set(false), EMPTY))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((r) => {
        this.shouts.set(r.shouts);
        this.totalShouts.set(r.pagination.totalCount);
        this.cargandoShouts.set(false);
      });

    this.busqueda.valueChanges
      .pipe(
        map((v) => v.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.paginaPosts.set(0);
        this.pedirPosts.next();
      });

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((q) => {
      this.pestana.set(q.get('tipo') === 'shouts' ? 'shouts' : 'posts');
    });
  }

  ngOnInit(): void {
    // Las dos listas se piden al entrar para mostrar el total en cada pestaña.
    this.pedirPosts.next();
    this.pedirShouts.next();
  }

  cambiarPestana(pestana: Pestana): void {
    if (pestana === this.pestana()) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tipo: pestana === 'shouts' ? 'shouts' : null },
      replaceUrl: true,
    });
  }

  /** Flechas izquierda/derecha entre pestañas (patrón ARIA de tabs). */
  teclaPestanas(e: KeyboardEvent): void {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const siguiente: Pestana = this.pestana() === 'posts' ? 'shouts' : 'posts';
    this.cambiarPestana(siguiente);
    queueMicrotask(() => document.getElementById(`favoritos-tab-${siguiente}`)?.focus());
  }

  filtrarCategoria(id: number): void {
    if (id === this.categoriaId()) return;
    this.categoriaId.set(id);
    this.paginaPosts.set(0);
    this.pedirPosts.next();
  }

  limpiarBusqueda(): void {
    this.busqueda.setValue('');
  }

  cambiarPaginaPosts(e: PageEvent): void {
    this.paginaPosts.set(e.pageIndex);
    this.pedirPosts.next();
  }

  cambiarPaginaShouts(e: PageEvent): void {
    this.paginaShouts.set(e.pageIndex);
    this.pedirShouts.next();
  }

  /** Quita o recupera (el endpoint alterna): la fila queda con "Deshacer". */
  alternarPost(fila: Fila<FavoritoPostLista>): void {
    if (fila.procesando) return;
    this.actualizarPost(fila.id, { procesando: true });
    this.favoritosService
      .deleteFavorito(fila.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          const quitado = r.eliminado;
          this.actualizarPost(fila.id, { quitado, procesando: false });
          this.ajustarConteoCategoria(fila.categoria.id, quitado ? -1 : 1);
        },
        error: () => this.actualizarPost(fila.id, { procesando: false }),
      });
  }

  alternarShout(fila: Fila<ShoutViewModel>): void {
    if (fila.procesando) return;
    this.actualizarShout(fila.id, { procesando: true });
    this.perfilService
      .alternarFavoritoShout(fila.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.actualizarShout(fila.id, { quitado: !r.activo, procesando: false });
          this.totalShouts.update((t) => (t ?? 0) + (r.activo ? 1 : -1));
        },
        error: () => this.actualizarShout(fila.id, { procesando: false }),
      });
  }

  private actualizarPost(id: number, cambios: Partial<Fila<FavoritoPostLista>>): void {
    this.posts.update((l) => l.map((f) => (f.id === id ? { ...f, ...cambios } : f)));
  }

  private actualizarShout(id: number, cambios: Partial<Fila<ShoutViewModel>>): void {
    this.shouts.update((l) => l.map((f) => (f.id === id ? { ...f, ...cambios } : f)));
  }

  private ajustarConteoCategoria(categoriaId: number, delta: number): void {
    this.categorias.update((l) => l.map((c) => (c.categoria.id === categoriaId ? { ...c, count: c.count + delta } : c)));
  }
}
