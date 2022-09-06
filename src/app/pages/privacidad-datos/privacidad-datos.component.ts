import { Component, OnInit } from '@angular/core';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-privacidad-datos',
  templateUrl: './privacidad-datos.component.html',
  styleUrls: ['./privacidad-datos.component.scss'],
})
export class PrivacidadDatosComponent implements OnInit {
  public configuracion: any = {};

  constructor(
    private displayService: DisplayComponentService,
    private generalService: IHttpGeneralService
  ) {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });
  }

  ngOnInit(): void {
    this.getConfiguration();
  }

  getConfiguration(): void {
    this.generalService.getConfiguracion().subscribe((value: any) => {
      this.configuracion = value;
    });
  }
}
