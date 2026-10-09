import { Component, OnInit } from '@angular/core';
import { TableSesionesComponent } from '../table-sesiones/table-sesiones.component';

@Component({
    selector: 'app-dashboard-sesiones',
    templateUrl: './dashboard-sesiones.component.html',
    styleUrls: ['./dashboard-sesiones.component.scss'],
    imports: [TableSesionesComponent]
})
export class DashboardSesionesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
