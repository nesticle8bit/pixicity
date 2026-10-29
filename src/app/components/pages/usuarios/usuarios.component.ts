import { MatTooltip } from '@angular/material/tooltip';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Subscription, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { SEOService } from 'src/app/services/shared/seo.service';
import { UsuarioListadoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { UsuarioSearchFilter } from 'src/app/models/shared/service-types.model';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { FollowButtonComponent } from '../../addons/follow-button/follow-button.component';
import { SelectAutocompleteComponent } from '../../shared/select-autocomplete/select-autocomplete.component';
import {
  SelectOptionDirective,
  SelectLabelDirective,
} from '../../shared/select-autocomplete/select-template.directives';
import { IHttpRangosService } from '../../../services/interfaces/httpRangos.interface';

type Orden = 'recientes' | 'puntos' | 'activos';

const POR_PAGINA = 25;

/**
 * /usuarios: directorio de la comunidad. Los filtros viven en la URL (?q, enLinea, genero, pais, rango, orden, page):
 * el formulario escribe en la URL y la URL dispara la carga. Así se pueden compartir y el botón atrás funciona.
 */
@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  imports: [MatTooltip, 
    RouterLink,
    UserPopoverDirective,
    UserAvatarComponent,
    FollowButtonComponent,
    MatPaginator,
    FormsModule,
    ReactiveFormsModule,
    SelectAutocompleteComponent,
    SelectOptionDirective,
    SelectLabelDirective,
    DecimalPipe,
  ],
})
export class UsuariosComponent implements OnInit {
  private parametrosService = inject(IHttpParametrosService);
  private displayService = inject(DisplayComponentService);
  private securityService = inject(IHttpSecurityService);
  private rangosService = inject(IHttpRangosService);
  private seoService = inject(SEOService);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private carga?: Subscription;

  readonly porPagina = POR_PAGINA;
  readonly esqueletos = Array.from({ length: 8 });

  public usuarios: UsuarioListadoViewModel[] = [];
  public totalCount = 0;
  public pagina = 1;
  public cargando = true;

  public paises: { id: number; nombre: string; iso2?: string }[] = [];
  public rangos: { id: number; nombre: string; icono?: string }[] = [];

  readonly generos = [
    { label: 'Cualquier género', value: '' },
    { label: 'Hombres', value: '1' },
    { label: 'Mujeres', value: '2' },
    { label: 'Otros', value: '3' },
  ];

  readonly ordenes: { label: string; value: Orden }[] = [
    { label: 'Más recientes', value: 'recientes' },
    { label: 'Más puntos', value: 'puntos' },
    { label: 'Activos recientemente', value: 'activos' },
  ];

  public formGroup: FormGroup = this.formBuilder.group({
    q: [''],
    enLinea: [false],
    genero: [''],
    pais: [null as number | null],
    rango: [null as number | null],
    orden: ['recientes' as Orden],
  });

  constructor() {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });
    this.seoService.setSEO({
      title: 'Usuarios',
      description:
        'Conoce a la comunidad: busca usuarios por nombre, país o rango y mira quién está en línea.',
      type: 'website',
      imageURL: '',
      tags: ['usuarios', 'comunidad', 'taringa'],
    });
  }

  ngOnInit(): void {
    this.getPaises();
    this.getRangos();

    // URL -> formulario + carga.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((p) => {
        const num = (k: string) => (p.get(k) ? Number(p.get(k)) : null);
        const orden = p.get('orden') as Orden | null;
        this.formGroup.setValue(
          {
            q: p.get('q') ?? '',
            enLinea: p.get('enLinea') === '1',
            genero: p.get('genero') ?? '',
            pais: num('pais'),
            rango: num('rango'),
            orden:
              orden && this.ordenes.some((o) => o.value === orden)
                ? orden
                : 'recientes',
          },
          { emitEvent: false },
        );
        this.pagina = Math.max(1, Number(p.get('page')) || 1);
        this.getUsuarios();
      });

    // Formulario -> URL. El buscador espera a que se deje de escribir; el resto se aplica al momento.
    this.formGroup.valueChanges
      .pipe(
        map((v) => JSON.stringify(v)),
        distinctUntilChanged(),
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.aplicarFiltros());
  }

  get hayFiltros(): boolean {
    const v = this.formGroup.value;
    return !!(v.q?.trim() || v.enLinea || v.genero || v.pais || v.rango);
  }

  aplicarFiltros(pagina = 1): void {
    const v = this.formGroup.value;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: v.q?.trim() || null,
        enLinea: v.enLinea ? 1 : null,
        genero: v.genero || null,
        pais: v.pais || null,
        rango: v.rango || null,
        orden: v.orden && v.orden !== 'recientes' ? v.orden : null,
        page: pagina > 1 ? pagina : null,
      },
    });
  }

  limpiarFiltros(): void {
    this.formGroup.patchValue(
      { q: '', enLinea: false, genero: '', pais: null, rango: null },
      { emitEvent: false },
    );
    this.aplicarFiltros();
  }

  pageChange(event: PageEvent): void {
    this.aplicarFiltros(event.pageIndex + 1);
    if (typeof window !== 'undefined')
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getUsuarios(): void {
    const v = this.formGroup.value;
    const filtro: UsuarioSearchFilter = {
      query: v.q,
      enLinea: v.enLinea,
      genero: v.genero,
      pais: v.pais,
      rango: v.rango,
      orden: v.orden,
      page: this.pagina,
      pageCount: POR_PAGINA,
    };

    this.cargando = true;
    // Cancela la carga anterior: escribir rápido no debe dejar una respuesta vieja en pantalla.
    this.carga?.unsubscribe();
    this.carga = this.securityService
      .getUsuarios(filtro)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.usuarios = response?.usuarios ?? [];
          this.totalCount = response?.pagination?.totalCount ?? 0;
          this.cargando = false;
        },
        error: () => (this.cargando = false),
      });
  }

  generoTexto(genero: number): string {
    return genero === 1 ? 'Hombre' : genero === 2 ? 'Mujer' : 'Otro';
  }

  /** "Activo hace 2 h", "hace 3 días"… a partir de los minutos que da el API. */
  ultimaVez(minutos: number | null): string {
    if (minutos === null || minutos === undefined)
      return 'Sin actividad reciente';
    if (minutos < 60)
      return `Activo hace ${Math.max(1, Math.round(minutos))} min`;
    const horas = minutos / 60;
    if (horas < 24) return `Activo hace ${Math.round(horas)} h`;
    const dias = Math.round(horas / 24);
    return dias < 30
      ? `Activo hace ${dias} ${dias === 1 ? 'día' : 'días'}`
      : 'Activo hace más de un mes';
  }

  private getPaises(): void {
    this.parametrosService
      .getPaisesDropdown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => (this.paises = values ?? []));
  }

  private getRangos(): void {
    this.rangosService
      .getRangosDropdown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => (this.rangos = values ?? []));
  }
}
