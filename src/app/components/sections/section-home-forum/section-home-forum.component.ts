import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { SEOService } from 'src/app/services/shared/seo.service';
import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { HomeLastPostsComponent } from '../../home/home-last-posts/home-last-posts.component';
import { HomeStatsComponent } from '../../home/home-stats/home-stats.component';
import { HomeLastCommentsComponent } from '../../home/home-last-comments/home-last-comments.component';
import { HomeTopPostsComponent } from '../../home/home-top-posts/home-top-posts.component';
import { HomeTopUsersComponent } from '../../home/home-top-users/home-top-users.component';
import { HomeTopCategoriasComponent } from '../../home/home-top-categorias/home-top-categorias.component';
import { HomeLastPhotosComponent } from '../../home/home-last-photos/home-last-photos.component';
import { HomeLastShoutsComponent } from '../../home/home-last-shouts/home-last-shouts.component';
import { HomeAfiliadosComponent } from '../../home/home-afiliados/home-afiliados.component';
import { TagsCloudComponent } from '../../addons/tags-cloud/tags-cloud.component';
import { AdsByTypeComponent } from '../../ads/ads-by-type/ads-by-type.component';
import { HomeLastRegisteredUsersComponent } from '../../home/home-last-registered-users/home-last-registered-users.component';
import { enNavegador } from '../../../shared/helpers/plataforma';

@Component({
    selector: 'app-section-home-forum',
    templateUrl: './section-home-forum.component.html',
    styleUrls: ['./section-home-forum.component.scss'],
    imports: [
        HomeLastPostsComponent,
        HomeStatsComponent,
        HomeLastCommentsComponent,
        HomeTopPostsComponent,
        HomeTopUsersComponent,
        HomeTopCategoriasComponent,
        HomeLastPhotosComponent,
        HomeLastShoutsComponent,
        HomeAfiliadosComponent,
        TagsCloudComponent,
        AdsByTypeComponent,
        HomeLastRegisteredUsersComponent,
    ],
})
export class SectionHomeForumComponent implements OnInit, OnDestroy {
  private displayService = inject(DisplayComponentService);
  private securityService = inject(IHttpSecurityService);
  private generalService = inject(IHttpGeneralService);
  private activatedRoute = inject(ActivatedRoute);
  private seoService = inject(SEOService);
  private title = inject(Title);

  private readonly destroyRef = inject(DestroyRef);

  public categoria: string = '';
  public displayComponent: DisplayComponentModel = {
    mainMenu: true,
    footer: true,
    searchFooter: true,
    submenu: true,
    background: '',
  };

  // Heartbeat de presencia online (ms). Mantiene Activo fresco mientras el usuario sigue en la página.
  private readonly onlineHeartbeatMs = 120000;
  private onlineHeartbeatTimer: any = null;

  constructor() {
    this.sessionOnlineUser();

    this.setSeoHome();
  }

  private setSeoHome(): void {
    this.seoService.setSEO({
      // Mismos textos que index.html (lo que Google muestra en el resultado de la portada).
      title: 'Taringa! - Inteligencia colectiva | Posts y comunidades',
      description:
        'Compartí y descubrí posts, guías, fotos, videos y memes en Taringa!, la comunidad de inteligencia colectiva. Sumate gratis, debatí y ganá puntos.',
      tags: ['taringa', 'comunidad', 'posts', 'memes', 'foros'],
      // 'website' es el unico og:type valido para una portada.
      type: 'website',
      imageURL: '',
    });
  }

  ngOnInit(): void {
    this.displayService.setDisplay(this.displayComponent);

    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.categoria = params.get('categoria') ?? '';
      // /posts/:categoria usa este mismo componente: sin esto todas las
      // categorias compartian title y description con la portada y Google
      // las colapsaba como duplicados.
      this.setSeoCategoria(this.categoria);
    });

    this.activatedRoute.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params?.ref) {
        this.generalService
          .setHitInByRefCode(params.ref)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((response) => {
            if (response) {
              console.log(
                '💖 Que bueno tener un referido como tú, bienvenido a nuestra comunidad'
              );
            }
          });
      }
    });
  }

  private setSeoCategoria(categoria: string): void {
    if (!categoria) {
      this.setSeoHome();
      return;
    }

    const nombre = categoria
      .split('-')
      .filter(Boolean)
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');

    this.seoService.setSEO({
      title: `${nombre} | Posts de la comunidad`,
      description: `Los últimos posts de ${nombre} en Taringa: lo que publica y comenta la comunidad, ordenado por lo más reciente.`,
      tags: [nombre.toLowerCase(), 'posts', 'taringa', 'comunidad'],
      type: 'website',
      imageURL: '',
    });
  }

  ngOnDestroy(): void {
    if (this.onlineHeartbeatTimer) {
      clearInterval(this.onlineHeartbeatTimer);
      this.onlineHeartbeatTimer = null;
    }
  }

  sessionOnlineUser(): void {
    // Primer ping inmediato + ping periódico para que el conteo refleje presencia real
    this.pingOnline();

    if (enNavegador()) this.onlineHeartbeatTimer = setInterval(
      () => this.pingOnline(),
      this.onlineHeartbeatMs
    );
  }

  private pingOnline(): void {
    this.securityService.sessionOnlineUser().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ error: () => undefined });
  }
}
