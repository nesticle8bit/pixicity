import { Component, OnInit } from '@angular/core';
import { TablePaginasComponent } from '../table-paginas/table-paginas.component';

@Component({
    selector: 'app-dashboard-paginas',
    templateUrl: './dashboard-paginas.component.html',
    styleUrls: ['./dashboard-paginas.component.scss'],
    imports: [TablePaginasComponent],
})
export class DashboardPaginasComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
