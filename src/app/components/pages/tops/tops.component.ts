import { MatTooltip } from '@angular/material/tooltip';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SelectAutocompleteComponent } from '../../shared/select-autocomplete/select-autocomplete.component';
import { SelectLabelDirective, SelectOptionDirective } from '../../shared/select-autocomplete/select-template.directives';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { AnuncioComponent } from '../../ads/anuncio/anuncio.component';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { ThumbPipe } from '../../../shared/pipes/thumb.pipe';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { ComunidadCategoria } from 'src/app/models/comunidades/comunidad.model';
import { CategoriaViewModel } from 'src/app/models/parametros/parametros-vm.model';
import { PostViewModel } from 'src/app/models/posts/post-vm.model';
import { TopComunidad, TopTema, TopUsuarioRanking } from 'src/app/models/web/tops.model';

export type SeccionTops = 'inicio' | 'posts' | 'comunidades' | 'temas' | 'usuarios';

interface FilasPorTipo {
  post: PostViewModel;
  comunidad: TopComunidad;
  tema: TopTema;
  usuario: TopUsuarioRanking;
}

/** Una tarjeta "tops-container": `tipo` elige cómo se dibuja cada fila; `items` queda undefined mientras carga. */
type TarjetaTop = {
  [K in keyof FilasPorTipo]: { titulo: string; icono: string; tipo: K; items?: FilasPorTipo[K][] };
}[keyof FilasPorTipo];

type FilaTop = FilasPorTipo[keyof FilasPorTipo];

const SECCIONES: SeccionTops[] = ['posts', 'comunidades', 'temas', 'usuarios'];

const SEO: Record<SeccionTops, { title: string; description: string }> = {
  inicio: {
    title: 'Tops | Lo mejor de Taringa',
    description: 'Los rankings de Taringa: posts con más puntos, comunidades más populares, temas más votados y usuarios con más puntos.',
  },
  posts: {
    title: 'Tops de posts | Los mejores posts de Taringa',
    description: 'Ranking de los posts más votados de Taringa: filtrá por categoría y por período para ver lo mejor de la comunidad.',
  },
  comunidades: {
    title: 'Tops de comunidades | Las comunidades más populares de Taringa',
    description: 'Ranking de las comunidades de Taringa con más miembros, más temas y más seguidores.',
  },
  temas: {
    title: 'Tops de temas | Los temas más votados de Taringa',
    description: 'Ranking de los temas de las comunidades de Taringa con más votos y más respuestas.',
  },
  usuarios: {
    title: 'Tops de usuarios | Los usuarios con más puntos de Taringa',
    description: 'Ranking de los usuarios de Taringa con más puntos y más seguidores.',
  },
};

@Component({
    selector: 'app-tops',
    templateUrl: './tops.component.html',
    styleUrls: ['./tops.component.scss'],
    imports: [MatTooltip,
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        SelectAutocompleteComponent,
        SelectLabelDirective,
        SelectOptionDirective,
        MatRadioGroup,
        MatRadioButton,
        AnuncioComponent,
        TruncatePipe,
        ThumbPipe,
        UserAvatarComponent,
        UserPopoverDirective,
    ],
})
export class TopsComponent implements OnInit {
  private httpParametrosService = inject(IHttpParametrosService);
  private comunidadesService = inject(IHttpComunidadesService);
  private displayService = inject(DisplayComponentService);
  private postService = inject(IHttpPostsService);
  private webService = inject(IHttpWebService);
  private formBuilder = inject(FormBuilder);
  private seoService = inject(SEOService);
  private route = inject(ActivatedRoute);

  private readonly destroyRef = inject(DestroyRef);
  /** Cada carga cancela la anterior: al cambiar rápido de pestaña o filtro no pisa una respuesta vieja. */
  private readonly carga$ = new Subject<void>();

  public formGroup: FormGroup;
  public seccion: SeccionTops = 'inicio';
  public categorias: CategoriaViewModel[] = [];
  public categoriasComunidad: ComunidadCategoria[] = [];
  public tarjetas: TarjetaTop[] = [];

  constructor() {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: ''
    });

    this.formGroup = this.formBuilder.group({
      date: 'all',
      categoria: undefined,
    });
  }

  /** Mitad de las tarjetas en cada columna (con impares, la de más va a la izquierda). */
  get columnas(): TarjetaTop[][] {
    const mitad = Math.ceil(this.tarjetas.length / 2);
    return [this.tarjetas.slice(0, mitad), this.tarjetas.slice(mitad)];
  }

  /** Las comunidades y sus temas se filtran por la taxonomía de comunidades; los posts, por la suya. */
  get filtroCategoria(): 'posts' | 'comunidades' | null {
    if (this.seccion === 'posts') return 'posts';
    if (this.seccion === 'comunidades' || this.seccion === 'temas') return 'comunidades';
    return null;
  }

  ngOnInit(): void {
    this.carga$
      .pipe(
        switchMap(() => this.peticion()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((tarjetas) => (this.tarjetas = tarjetas));

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const seccion = params.get('seccion') as SeccionTops;
      this.seccion = SECCIONES.includes(seccion) ? seccion : 'inicio';
      this.seoService.setSEO({
        ...SEO[this.seccion],
        type: 'website',
        imageURL: '',
        tags: ['tops', 'ranking', 'taringa', this.seccion],
      });
      // Cada sección usa otra taxonomía: la categoría elegida no sirve en la siguiente.
      this.formGroup.patchValue({ categoria: undefined }, { emitEvent: false });
      this.cargar();
    });

    this.getCategorias();
  }

  cargar(): void {
    // Las filas de antes quedan fuera hasta que llega la respuesta (no se muestra "No hay nada" mientras carga).
    this.tarjetas = this.estructura();
    this.carga$.next();
  }

  private estructura(): TarjetaTop[] {
    switch (this.seccion) {
      case 'posts':
        return [
          { titulo: 'Top post con más puntos', icono: 'icon moneda', tipo: 'post' },
          { titulo: 'Top post más comentarios', icono: 'i comentarios', tipo: 'post' },
          { titulo: 'Top post más favoritos', icono: 'i estrella-plus', tipo: 'post' },
          { titulo: 'Top post con más seguidores', icono: 'i personas', tipo: 'post' },
        ];
      case 'comunidades':
        return [
          { titulo: 'Comunidades más populares', icono: 'ti ti-users-group', tipo: 'comunidad' },
          { titulo: 'Comunidades con más temas', icono: 'ti ti-messages', tipo: 'comunidad' },
          { titulo: 'Top comunidad con más seguidores', icono: 'i personas', tipo: 'comunidad' },
        ];
      case 'temas':
        return [
          { titulo: 'Temas más votados', icono: 'ti ti-thumb-up', tipo: 'tema' },
          { titulo: 'Temas con más respuestas', icono: 'i comentarios', tipo: 'tema' },
        ];
      case 'usuarios':
        return [
          { titulo: 'Top usuario con más puntos', icono: 'icon moneda', tipo: 'usuario' },
          { titulo: 'Top usuario con más seguidores', icono: 'i personas', tipo: 'usuario' },
        ];
      default:
        return [
          { titulo: 'Top post con más puntos', icono: 'icon moneda', tipo: 'post' },
          { titulo: 'Comunidades más populares', icono: 'ti ti-users-group', tipo: 'comunidad' },
          { titulo: 'Temas más votados', icono: 'ti ti-thumb-up', tipo: 'tema' },
          { titulo: 'Top usuario con más puntos', icono: 'icon moneda', tipo: 'usuario' },
        ];
    }
  }

  /** Pide la sección actual y reparte cada lista en su tarjeta, en el orden de {@link estructura}. */
  private peticion(): Observable<TarjetaTop[]> {
    const date: string = this.formGroup.value.date ?? 'all';
    const categoria: number | undefined = this.formGroup.value.categoria ?? undefined;
    const tarjetas = this.estructura();
    // Cada lista llega en el orden de las tarjetas, así que su tipo coincide con el `tipo` de la tarjeta.
    const llenar = (listas: (FilaTop[] | undefined)[]) =>
      tarjetas.map((t, i) => ({ ...t, items: listas[i] ?? [] }) as TarjetaTop);

    switch (this.seccion) {
      case 'posts':
        return this.postService.getTopPosts(date, categoria).pipe(
          map((r) => llenar([r?.postsConMasPuntos, r?.postsConMasComentarios, r?.postsConMasFavoritos, r?.postsConMasSeguidores])),
        );
      case 'comunidades':
        return this.webService.getTopComunidades(date, categoria).pipe(
          map((r) => llenar([r?.conMasMiembros, r?.conMasTemas, r?.conMasSeguidores])),
        );
      case 'temas':
        return this.webService.getTopTemas(date, categoria).pipe(
          map((r) => llenar([r?.conMasVotos, r?.conMasComentarios])),
        );
      case 'usuarios':
        return this.webService.getTopUsuariosRankings(date).pipe(
          map((r) => llenar([r?.conMasPuntos, r?.conMasSeguidores])),
        );
      default:
        return this.webService.getTopsResumen(date).pipe(
          map((r) => llenar([r?.posts, r?.comunidades, r?.temas, r?.usuarios])),
        );
    }
  }

  getCategorias(): void {
    this.httpParametrosService
      .getCategoriasDropdown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => {
        this.categorias = values;
      });

    this.comunidadesService
      .getCategorias()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => {
        this.categoriasComunidad = values;
      });
  }
}
