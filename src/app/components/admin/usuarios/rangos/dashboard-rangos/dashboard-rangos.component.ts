import { Component, OnInit } from '@angular/core';
import { TableRangosComponent } from '../table-rangos/table-rangos.component';

@Component({
    selector: 'app-dashboard-rangos',
    templateUrl: './dashboard-rangos.component.html',
    styleUrls: ['./dashboard-rangos.component.scss'],
    imports: [TableRangosComponent]
})
export class DashboardRangosComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
