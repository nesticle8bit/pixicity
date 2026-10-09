import { Component } from '@angular/core';
import { TableCensurasComponent } from '../table-censuras/table-censuras.component';

@Component({
    selector: 'app-dashboard-censuras',
    templateUrl: './dashboard-censuras.component.html',
    styleUrls: ['./dashboard-censuras.component.scss'],
    imports: [TableCensurasComponent],
})
export class DashboardCensurasComponent {}
