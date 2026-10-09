import { Component, OnInit } from '@angular/core';
import { TableContactosComponent } from '../table-contactos/table-contactos.component';

@Component({
    selector: 'app-dashboard-contactos',
    templateUrl: './dashboard-contactos.component.html',
    styleUrls: ['./dashboard-contactos.component.scss'],
    imports: [TableContactosComponent]
})
export class DashboardContactosComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
