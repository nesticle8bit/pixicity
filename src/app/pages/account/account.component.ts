import { Component, OnInit } from '@angular/core';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  public currentUser: any;
  public paises: any[] = [];
  public estados: any[] = [];
  public generos: any[] = [{
    value: 1,
    label: 'Masculino'
  },
  {
    value: 2,
    label: 'Femenino'
  },
  {
    value: 3,
    label: 'Otro'
  }];

  public dias: any[] = [];
  public meses: any[] = [
    {
      label: 'Enero',
      value: '01'
    },
    {
      label: 'Febrero',
      value: '02'
    },
    {
      label: 'Marzo',
      value: '03'
    },
    {
      label: 'Abril',
      value: '04'
    },
    {
      label: 'Mayo',
      value: '05'
    },
    {
      label: 'Junio',
      value: '06'
    },
    {
      label: 'Julio',
      value: '07'
    },
    {
      label: 'Agosto',
      value: '08'
    },
    {
      label: 'Septiembre',
      value: '09'
    },
    {
      label: 'Octubre',
      value: '10'
    },
    {
      label: 'Noviembre',
      value: '11'
    },
    {
      label: 'Diciembre',
      value: '12'
    }
  ];
  public years: any[] = [];

  constructor(
    private securityService: IHttpSecurityService,
    private parametrosService: IHttpParametrosService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
    this.getPaises();
    this.initFechas();
  }

  initFechas(): void {
    for (let index = 0; index < 31; index++) {
      this.dias.push(index + 1);
    }

    for (let index = new Date().getFullYear() - 1; index > 1919; index--) {
      this.years.push(index);
    }
  }

  getPaises(): void {
    this.parametrosService.getPaisesDropdown().subscribe((values: any) => {
      this.paises = values;
    });
  }

  getEstadosByPais(pais: any): void {
    if (!pais) {
      return;
    }

    this.parametrosService.getEstadosByPais(pais.id).subscribe((values: any) => {
      this.estados = values;
    });
  }
}
