import { environment } from 'src/environments/environment';
import { DisplayComponentService } from './services/shared/displayComponents.service';
import { DisplayComponentModel } from './models/shared/displayComponent.model';
import { Component, DestroyRef, EventEmitter, inject, Output, PLATFORM_ID, RESPONSE_INIT } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { SEOService } from './services/shared/seo.service';
import { SEOModel } from './models/shared/seo.model';
import { Meta, Title } from '@angular/platform-browser';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { MainHeaderComponent } from './components/main/main-header/main-header.component';
import { MobileDrawerComponent } from './components/main/mobile-drawer/mobile-drawer.component';
import { MainMenuComponent } from './components/main/main-menu/main-menu.component';
import { MainSubmenuComponent } from './components/main/main-submenu/main-submenu.component';
import { MainUltimasNoticiasComponent } from './components/main/main-ultimas-noticias/main-ultimas-noticias.component';
import { MainFooterComponent } from './components/main/main-footer/main-footer.component';
import { AvisoEmailComponent } from './components/shared/aviso-email/aviso-email.component';
import { SsrSalud } from './shared/helpers/ssr-salud';

/** Tarjeta social del sitio (1200x630) para páginas sin imagen propia. */
const DEFAULT_OG_IMAGE = '/assets/images/og-image.jpg';
/** Mismos textos que index.html: los usan las páginas sin título o descripción propios. */
const DEFAULT_TITLE = 'Taringa! - Inteligencia colectiva | Posts y comunidades';
const DEFAULT_DESCRIPTION =
  'Compartí y descubrí posts, guías, fotos, videos y memes en Taringa!, la comunidad de inteligencia colectiva. Sumate gratis, debatí y ganá puntos.';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
        NgxUiLoaderModule,
        MainHeaderComponent,
        MobileDrawerComponent,
        MainMenuComponent,
        MainSubmenuComponent,
        MainUltimasNoticiasComponent,
        AvisoEmailComponent,
        RouterOutlet,
        MainFooterComponent,
    ],
})
export class AppComponent {
  private displayComponentService = inject(DisplayComponentService);
  private seoService = inject(SEOService);
  private router = inject(Router);
  private title = inject(Title);
  private meta = inject(Meta);

  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  // En el render del servidor (SSR, solo para bots) no hay window: ver isPlatformBrowser.
  private readonly esNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  // Respuesta HTTP del render en el servidor: permite devolver 404/403 reales a los bots.
  private readonly respuestaSsr = inject(RESPONSE_INIT, { optional: true });
  private readonly ssrSalud = inject(SsrSalud);

  public displayComponent: DisplayComponentModel = {
    mainMenu: true,
    footer: true,
    searchFooter: true,
    submenu: true,
    background: '',
  };

  /** url("…") del fondo de página, sin caracteres que cierren el url() (la URL la escribe un usuario). */
  get fondoPaginaCss(): string | null {
    const url = (this.displayComponent.background ?? '').trim().replace(/["()\\]/g, '');
    return /^https?:\/\//i.test(url) ? `url("${url}")` : null;
  }

  constructor() {
    this.displayComponentService
      .getDisplay()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (value: DisplayComponentModel) => (this.displayComponent = value),
      );

    this.seoService
      .getSEO()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: SEOModel) => {
      // Sin título/descripción propios se vuelve a los del sitio: antes quedaban los de la página anterior.
      const titulo = value.title || DEFAULT_TITLE;
      this.title.setTitle(this.buildTitle(titulo));
      this.meta.updateTag({ property: 'og:title', content: titulo });
      this.meta.updateTag({ name: 'twitter:title', content: titulo });
      this.meta.updateTag({
        property: 'og:site_name',
        content: 'Taringa! - Inteligencia colectiva',
      });

      const descripcion = value.description || DEFAULT_DESCRIPTION;
      this.meta.updateTag({
        name: 'description',
        content: descripcion,
      });
      this.meta.updateTag({
        property: 'og:description',
        content: descripcion,
      });
      this.meta.updateTag({
        name: 'twitter:description',
        content: descripcion,
      });

      if (value.tags?.length) {
        this.meta.updateTag({
          name: 'keywords',
          content: value.tags.join(', ').toLowerCase(),
        });
      } else {
        this.meta.removeTag("name='keywords'");
      }

      // og:image debe ser absoluta: las redes y Google descartan las relativas. Sin imagen propia se usa la
      // tarjeta del sitio (1200x630); si no, quedaba la imagen de la página anterior al navegar.
      const imagen = this.toAbsoluteUrl(value.imageURL || DEFAULT_OG_IMAGE);
      this.meta.updateTag({ property: 'og:image', content: imagen });
      this.meta.updateTag({ name: 'twitter:image', content: imagen });
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      if (value.imageURL) {
        // Las dimensiones de la tarjeta por defecto no aplican a una imagen arbitraria.
        this.meta.removeTag("property='og:image:width'");
        this.meta.removeTag("property='og:image:height'");
      } else {
        this.meta.updateTag({ property: 'og:image:width', content: '1200' });
        this.meta.updateTag({ property: 'og:image:height', content: '630' });
      }

      this.meta.updateTag({ property: 'og:type', content: value.type || 'website' });

      // article:* solo tiene sentido cuando og:type es 'article'.
      this.setArticleMeta(value);

      if (value.canonical) {
        this.setCanonical(value.canonical);
        this.meta.updateTag({ property: 'og:url', content: value.canonical });
      }

      this.meta.updateTag({
        name: 'robots',
        content: value.noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1',
      });

      this.setJsonLd(value.jsonLd);
      this.setStatusSsr(value.statusCode);
    });

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((evt) => {
      if (evt instanceof NavigationStart) {
        this.seoService.iniciarNavegacion();
        return;
      }

      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      if (this.esNavegador) {
        window.scrollTo(0, 0);
      }
      // Canonical por defecto = URL absoluta actual (sin query params).
      // Si una página setea uno específico vía SEOService, lo sobrescribe.
      const origin = environment.publicUrl;
      const [path, query] = evt.urlAfterRedirects.split('?');
      // Se conserva ?page= : cada pagina de un listado es una URL distinta y
      // necesita canonical propio, si no Google descarta las paginas 2..N.
      const page = new URLSearchParams(query ?? '').get('page');
      const sufijo = page && page !== '1' ? `?page=${encodeURIComponent(page)}` : '';
      this.setCanonical(`${origin}${path}${sufijo}`);
    });
  }

  /**
   * Google corta el title alrededor de los 60 caracteres. Se agrega la marca
   * solo si entra; si el titulo ya es largo, el sufijo solo robaria espacio.
   */
  private buildTitle(titulo: string): string {
    const MAX = 60;
    const sufijoCorto = ' - Taringa';
    const sufijoLargo = ' - Taringa - Inteligencia colectiva';

    // Cada página de un listado tiene canonical propio (?page=N): sin esto todas compartían título.
    const pagina = this.paginaActual();
    if (pagina > 1 && !/página \d/i.test(titulo)) {
      titulo = `${titulo} - Página ${pagina}`;
    }

    if (/taringa/i.test(titulo)) {
      return titulo;
    }

    if (titulo.length + sufijoLargo.length <= MAX) {
      return `${titulo}${sufijoLargo}`;
    }

    if (titulo.length + sufijoCorto.length <= MAX) {
      return `${titulo}${sufijoCorto}`;
    }

    return titulo;
  }

  private paginaActual(): number {
    const query = this.router.url.split('?')[1] ?? '';
    const pagina = Number(new URLSearchParams(query.split('#')[0]).get('page'));
    return Number.isInteger(pagina) ? pagina : 1;
  }

  private setArticleMeta(value: SEOModel): void {
    const tags: [string, string | undefined][] = [
      ['article:published_time', value.publishedTime],
      ['article:modified_time', value.modifiedTime],
      ['article:author', value.author],
      ['article:section', value.section],
    ];

    for (const [property, content] of tags) {
      if (value.type === 'article' && content) {
        this.meta.updateTag({ property, content });
      } else {
        this.meta.removeTag(`property='${property}'`);
      }
    }
  }

  /** Skip-link: mueve el foco al contenido sin navegar (con <base href> un "#ancla" iría a la portada). */
  saltarAlContenido(event: Event): void {
    event.preventDefault();
    const main = this.document.getElementById('contenido-principal');
    main?.focus();
    main?.scrollIntoView();
  }

  private toAbsoluteUrl(url: string): string {
    if (!url || /^https?:\/\//i.test(url)) {
      return url;
    }

    const origin = environment.publicUrl;
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  private setJsonLd(data: SEOModel['jsonLd']): void {
    const head = this.document.head;
    let script = head.querySelector('script[type="application/ld+json"][data-page-seo]');

    if (!data) {
      script?.remove();
      return;
    }

    if (!script) {
      script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-page-seo', '');
      head.appendChild(script);
    }

    script.textContent = JSON.stringify(data);
  }

  /** Status HTTP real del render en el servidor (404 de páginas inexistentes en vez de un soft 404). */
  private setStatusSsr(statusCode?: number): void {
    // Si el API falló durante el render (SsrSalud) se queda el 503: nunca convertir un fallo en "no encontrado".
    // Tampoco se pisa el 301 de RedireccionCanonica con el 200 de la vista de destino.
    if (this.respuestaSsr && !this.ssrSalud.apiFallo && this.respuestaSsr.status !== 301) {
      this.respuestaSsr.status = statusCode || 200;
    }
  }

  private setCanonical(url: string): void {
    const head = this.document.head;
    let link: HTMLLinkElement | null = head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
