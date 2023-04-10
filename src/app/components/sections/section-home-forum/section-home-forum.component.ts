import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { SEOService } from 'src/app/services/shared/seo.service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-section-home-forum',
  templateUrl: './section-home-forum.component.html',
  styleUrls: ['./section-home-forum.component.scss'],
})
export class SectionHomeForumComponent implements OnInit {
  public categoria: string = '';
  public displayComponent: DisplayComponentModel = {
    mainMenu: true,
    footer: true,
    searchFooter: true,
    submenu: true,
    background: '',
  };

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
        'Pixicity - Ciudad Pixelada | Comunidad para Compartir Información',
      description: '',
      tags: [],
      type: 'Red social',
      imageURL: '',
    });

    this.title.setTitle(
      'Pixicity - Ciudad Pixelada | Comunidad para Compartir Información'
    );
  }

  ngOnInit(): void {
    this.displayService.setDisplay(this.displayComponent);

    this.activatedRoute.paramMap.subscribe((params: any) => {
      this.categoria = params.get('categoria');
    });

    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params?.ref) {
        this.generalService
          .setHitInByRefCode(params.ref)
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

  sessionOnlineUser(): void {
    this.securityService.sessionOnlineUser().subscribe((response: any) => {
      console.log(
        '🐼 Estos mensajes van a ser temporales, ignora y cierra el inspeccionar \n Att: Pixicity!'
      );
    });
  }
}
