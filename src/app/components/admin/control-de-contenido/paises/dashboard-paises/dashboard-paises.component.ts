import { Component, OnInit } from '@angular/core';
import { TablePaisesComponent } from '../table-paises/table-paises.component';

@Component({
    selector: 'app-dashboard-paises',
    templateUrl: './dashboard-paises.component.html',
    styleUrls: ['./dashboard-paises.component.scss'],
    imports: [TablePaisesComponent]
})
export class DashboardPaisesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
