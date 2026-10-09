import { Component, OnInit } from '@angular/core';
import { TableShoutsComponent } from '../table-shouts/table-shouts.component';

@Component({
    selector: 'app-dashboard-shouts',
    templateUrl: './dashboard-shouts.component.html',
    styleUrls: ['./dashboard-shouts.component.scss'],
    imports: [TableShoutsComponent]
})
export class DashboardShoutsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
