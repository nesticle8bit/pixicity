import { Component, OnInit } from '@angular/core';
import { TableAfiliadosComponent } from '../table-afiliados/table-afiliados.component';

@Component({
    selector: 'app-dashboard-afiliados',
    templateUrl: './dashboard-afiliados.component.html',
    styleUrls: ['./dashboard-afiliados.component.scss'],
    imports: [TableAfiliadosComponent]
})
export class DashboardAfiliadosComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
