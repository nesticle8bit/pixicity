import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'section-home',
  templateUrl: './section-home.component.html',
  styleUrls: ['./section-home.component.scss'],
})
export class SectionHomeComponent implements OnInit {
  public categoria: string = '';
  public displayComponent: DisplayComponentModel = {
    mainMenu: true,
    footer: true,
    searchFooter: true,
    submenu: true,
    background: ''
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    private generalService: IHttpGeneralService
  ) {
    this.sessionOnlineUser();
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
      console.log('🐼 Estos mensajes van a ser temporales, ignora y cierra el inspeccionar \n Att: Pixicity!');
    });
  }
}
