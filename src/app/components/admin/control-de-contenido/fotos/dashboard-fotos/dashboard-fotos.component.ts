import { Component } from '@angular/core';
import { TableFotosComponent } from '../table-fotos/table-fotos.component';

@Component({
    selector: 'app-dashboard-fotos',
    templateUrl: './dashboard-fotos.component.html',
    styleUrls: ['./dashboard-fotos.component.scss'],
    imports: [TableFotosComponent],
})
export class DashboardFotosComponent {}
