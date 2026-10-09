import { Component, OnInit } from '@angular/core';
import { TableMonitorComponent } from '../table-monitor/table-monitor.component';

@Component({
    selector: 'app-dashboard-monitor',
    templateUrl: './dashboard-monitor.component.html',
    styleUrls: ['./dashboard-monitor.component.scss'],
    imports: [TableMonitorComponent]
})
export class DashboardMonitorComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
