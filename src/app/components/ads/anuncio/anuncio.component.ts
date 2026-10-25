import { booleanAttribute, Component, DestroyRef, effect, ElementRef, inject, input, signal, untracked } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTooltip } from '@angular/material/tooltip';
import { AnunciosService } from 'src/app/services/shared/anuncios.service';
import { HomeDiscordComponent } from '../../home/home-discord/home-discord.component';
import { ContenidoSeoPipe } from '../../../shared/pipes/contenidoSeo.pipe';
import { enNavegador } from '../../../shared/helpers/plataforma';
import { AnuncioPublico, UbicacionAnuncio } from '../anuncios';

/** Visto = al menos la mitad en pantalla durante este tiempo (el criterio habitual de una impresión). */
const MS_PARA_IMPRESION = 1000;

/**
 * Un espacio de publicidad. Elige el anuncio de su ubicación que aplique a la página (categoría, comunidad), al
 * dispositivo y a la sesión, y cuenta la impresión cuando se ve de verdad y el clic en sus enlaces. Si no hay
 * ninguno no ocupa lugar. En el SSR no muestra nada (el azar del servidor no coincidiría con el del navegador).
 */
@Component({
  selector: 'app-anuncio',
  templateUrl: './anuncio.component.html',
  styleUrls: ['./anuncio.component.scss'],
  imports: [MatTooltip, HomeDiscordComponent, ContenidoSeoPipe],
  host: { '[class.anuncio--vacio]': '!anuncio()' },
})
export class AnuncioComponent {
  private anunciosService = inject(AnunciosService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly ubicacion = input.required<UbicacionAnuncio>();
  readonly categoriaId = input<number | null>(null);
  readonly categoriaSeo = input<string | null>(null);
  readonly comunidadId = input<number | null>(null);
  /** Título "Publicidad" de las columnas laterales; sin él, solo una etiqueta chica. */
  readonly encabezado = input(false, { transform: booleanAttribute });

  readonly anuncio = signal<AnuncioPublico | null>(null);

  private eleccion?: Subscription;
  private observador?: IntersectionObserver;
  private espera?: ReturnType<typeof setTimeout>;
  /** Id del anuncio cuya impresión ya se contó en este espacio. */
  private contado: number | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Otra página con el mismo componente (de un post a otro): se vuelve a elegir para el contexto nuevo.
    effect(() => {
      const ubicacion = this.ubicacion();
      const contexto = { categoriaId: this.categoriaId(), categoriaSeo: this.categoriaSeo(), comunidadId: this.comunidadId() };
      untracked(() => {
        this.eleccion?.unsubscribe();
        this.eleccion = this.anunciosService.elegir(ubicacion, contexto).subscribe((a) => this.mostrar(a));
      });
    });

    if (enNavegador() && 'IntersectionObserver' in window) {
      this.observador = new IntersectionObserver(([e]) => this.alCambiarVisibilidad(e), { threshold: [0, 0.5] });
    }
    destroyRef.onDestroy(() => {
      this.eleccion?.unsubscribe();
      this.observador?.disconnect();
      clearTimeout(this.espera);
    });
  }

  /** Clic (o clic del medio) en un enlace del anuncio. Los iframes de terceros no avisan: esos no se cuentan. */
  alHacerClic(event: MouseEvent): void {
    const a = this.anuncio();
    if (!a || event.button > 1) return;
    if (event.target instanceof Element && event.target.closest('a[href]')) this.anunciosService.registrar(a.id, 'clic');
  }

  private mostrar(anuncio: AnuncioPublico | null): void {
    this.anuncio.set(anuncio);
    this.contado = null;
    clearTimeout(this.espera);
    this.espera = undefined;
    // Volver a observar provoca un primer aviso: el espacio pudo pasar de vacío (sin alto) a tener anuncio.
    this.observador?.disconnect();
    if (anuncio) this.observador?.observe(this.host);
  }

  private alCambiarVisibilidad(e: IntersectionObserverEntry): void {
    const anuncio = this.anuncio();
    if (!anuncio || this.contado === anuncio.id) return;

    if (e.intersectionRatio < 0.5) {
      clearTimeout(this.espera);
      this.espera = undefined;
      return;
    }
    this.espera ??= setTimeout(() => {
      this.espera = undefined;
      const actual = this.anuncio();
      if (!actual || this.contado === actual.id) return;
      this.contado = actual.id;
      this.anunciosService.registrar(actual.id, 'impresion');
    }, MS_PARA_IMPRESION);
  }
}
