import { Component, OnInit } from '@angular/core';
import { TableCategoriasComponent } from '../table-categorias/table-categorias.component';

@Component({
    selector: 'app-dashboard-categorias',
    templateUrl: './dashboard-categorias.component.html',
    styleUrls: ['./dashboard-categorias.component.scss'],
    imports: [TableCategoriasComponent]
})
export class DashboardCategoriasComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
