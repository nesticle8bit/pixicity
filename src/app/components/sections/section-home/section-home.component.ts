import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
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
import { HomeLastPhotosComponent } from '../../home/home-last-photos/home-last-photos.component';
import { HomeLastShoutsComponent } from '../../home/home-last-shouts/home-last-shouts.component';
import { TagsCloudComponent } from '../../addons/tags-cloud/tags-cloud.component';
import { HomeAfiliadosComponent } from '../../home/home-afiliados/home-afiliados.component';
import { AdsByTypeComponent } from '../../ads/ads-by-type/ads-by-type.component';
import { enNavegador } from '../../../shared/helpers/plataforma';

@Component({
    selector: 'section-home',
    templateUrl: './section-home.component.html',
    styleUrls: ['./section-home.component.scss'],
    imports: [
        HomeLastPostsComponent,
        HomeStatsComponent,
        HomeLastCommentsComponent,
        HomeTopPostsComponent,
        HomeTopUsersComponent,
        HomeLastPhotosComponent,
        HomeLastShoutsComponent,
        TagsCloudComponent,
        HomeAfiliadosComponent,
        AdsByTypeComponent,
    ],
})
export class SectionHomeComponent implements OnInit, OnDestroy {
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

  constructor(
    private activatedRoute: ActivatedRoute,
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    private generalService: IHttpGeneralService,
    private seoService: SEOService,
    private title: Title
  ) {
    this.sessionOnlineUser();

    this.seoService.setSEO({
      title:
        'Taringa - Inteligencia colectiva | Comunidad para Compartir Información',
      description: '',
      tags: [],
      type: 'Red social',
      imageURL: '',
    });

    this.title.setTitle(
      'Taringa - Inteligencia colectiva | Comunidad para Compartir Información'
    );
  }

  ngOnInit(): void {
    this.displayService.setDisplay(this.displayComponent);

    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.categoria = params.get('categoria') ?? '';
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
