import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-shouts-view',
  templateUrl: './shouts-view.component.html',
  styleUrls: ['./shouts-view.component.scss'],
})
export class ShoutsViewComponent implements OnInit {
  public currentUser: any;
  public shout: any;

  constructor(
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    private activatedRoute: ActivatedRoute,
    private perfilService: IHttpPerfilService,
  ) {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: false,
      submenu: false,
      background: '',
    });

    this.getParameters();
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  getParameters(): void {
    this.activatedRoute.paramMap.subscribe((paramsMap: any) => {
      this.getCurrentShout(paramsMap.params?.id);
    });
  }

  getCurrentShout(shoutId: number): void {
    if(!shoutId) {
      return;
    }

    this.perfilService.getShoutById(shoutId).subscribe((value: any) => {
      this.shout = value;
    });
  }

  eliminarShout(): void {

  }
}
