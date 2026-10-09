import { environment } from 'src/environments/environment';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { SEOService } from 'src/app/services/shared/seo.service';
import { DatePipe, DOCUMENT } from '@angular/common';
import { ContenidoSeoPipe } from '../../../shared/pipes/contenidoSeo.pipe';

@Component({
    selector: 'app-paginas',
    templateUrl: './paginas.component.html',
    styleUrls: ['./paginas.component.scss'],
    imports: [DatePipe, ContenidoSeoPipe],
})
export class PaginasComponent implements OnInit {
  private readonly documento = inject(DOCUMENT);
  private displayService = inject(DisplayComponentService);
  private activatedRoute = inject(ActivatedRoute);
  private webService = inject(IHttpWebService);
  private seoService = inject(SEOService);

  private readonly destroyRef = inject(DestroyRef);

  public slug: string = '';
  public pagina: any;

  constructor() {
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.slug = params.get('slug') ?? '';
      this.getPaginaBySlug();
    });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });
  }

  ngOnInit(): void {}

  getPaginaBySlug(): void {
    this.webService
      .getPaginaBySlug(`/paginas/${this.slug}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response) {
          response.fechaActualiza = response.fechaActualiza
            ? response.fechaActualiza
            : response.fechaRegistro;
          this.pagina = response;

          const limpio = (response.contenido || '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          this.seoService.setSEO({
            title: response.titulo,
            description: limpio
              ? limpio.substring(0, 160)
              : `${response.titulo} - Taringa`,
            type: 'website',
            imageURL: '',
            tags: [response.titulo, 'taringa'],
            canonical: `${environment.publicUrl}${this.documento.location.pathname}`,
          });
          return;
        }

        // Slug inexistente: 404 real, no una pagina vacia con status 200.
        this.seoService.setSEO({
          title: 'Página no encontrada',
          description: 'La página que buscás no existe.',
          type: 'website',
          imageURL: '',
          tags: [],
          noIndex: true,
          statusCode: 404,
        });
      });
  }
}
