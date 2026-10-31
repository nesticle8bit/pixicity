import { Observable } from 'rxjs';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { PortadaService } from 'src/app/services/shared/portada.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { RouterLink } from '@angular/router';

/** Una opción del menú: con ícono en posts, solo el nombre en comunidades. */
interface OpcionCategoria {
  nombre: string;
  seo: string;
  icono?: string;
}

@Component({
    selector: 'app-categories-selector',
    templateUrl: './categories-selector.component.html',
    styleUrls: ['./categories-selector.component.scss'],
    imports: [RouterLink]
})
export class CategoriesSelectorComponent implements OnInit {
  private httpParametrosService = inject(IHttpParametrosService);
  private comunidadesService = inject(IHttpComunidadesService);

  private readonly destroyRef = inject(DestroyRef);
  private portada = inject(PortadaService);

  /** posts: lleva a /posts/:seo. comunidades: filtra /comunidades con ?categoria=seo. */
  @Input() tipo: 'posts' | 'comunidades' = 'posts';
  /** SEO de la categoría elegida (solo comunidades): se muestra en el botón. */
  @Input() seleccionada = '';

  public display: boolean = false;
  public categorias: OpcionCategoria[] = [];

  ngOnInit(): void {
    this.getCategorias();
  }

  get etiqueta(): string {
    return this.categorias.find((c) => c.seo === this.seleccionada)?.nombre ?? 'Todas las categorías';
  }

  getCategorias(): void {
    const pedido: Observable<OpcionCategoria[]> = this.tipo === 'comunidades'
      ? this.comunidadesService.getCategorias()
      : this.portada.tomar('categorias', this.httpParametrosService.getCategoriasDropdown());

    pedido
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => {
        this.categorias = values ?? [];
      });
  }

}
