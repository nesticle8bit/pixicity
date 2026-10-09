import { Component, OnInit } from '@angular/core';
import { TableUsuariosComponent } from '../table-usuarios/table-usuarios.component';

@Component({
    selector: 'app-dashboard-usuarios',
    templateUrl: './dashboard-usuarios.component.html',
    styleUrls: ['./dashboard-usuarios.component.scss'],
    imports: [TableUsuariosComponent]
})
export class DashboardUsuariosComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
