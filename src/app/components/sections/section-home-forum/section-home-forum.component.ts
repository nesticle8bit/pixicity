import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { SEOService } from 'src/app/services/shared/seo.service';
import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-section-home-forum',
  templateUrl: './section-home-forum.component.html',
  styleUrls: ['./section-home-forum.component.scss'],
})
export class SectionHomeForumComponent implements OnInit, OnDestroy {
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
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    private generalService: IHttpGeneralService,
    private activatedRoute: ActivatedRoute,
    private seoService: SEOService,
    private title: Title
  ) {
    this.sessionOnlineUser();

    this.seoService.setSEO({
      title:
        'Taringas - Inteligencia colectiva | Comunidad para Compartir Información',
      description: '',
      tags: [],
      type: 'Red social',
      imageURL: '',
    });

    this.title.setTitle(
      'Taringas - Inteligencia colectiva | Comunidad para Compartir Información'
    );
  }

  ngOnInit(): void {
    this.displayService.setDisplay(this.displayComponent);

    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params: any) => {
      this.categoria = params.get('categoria');
    });

    this.activatedRoute.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params: any) => {
      if (params?.ref) {
        this.generalService
          .setHitInByRefCode(params.ref)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((response: any) => {
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

    this.onlineHeartbeatTimer = setInterval(
      () => this.pingOnline(),
      this.onlineHeartbeatMs
    );
  }

  private pingOnline(): void {
    this.securityService.sessionOnlineUser().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {});
  }
}
