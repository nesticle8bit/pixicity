import { Component, OnInit } from '@angular/core';
import { TableNoticiasComponent } from '../table-noticias/table-noticias.component';

@Component({
    selector: 'app-dashboard-noticias',
    templateUrl: './dashboard-noticias.component.html',
    styleUrls: ['./dashboard-noticias.component.scss'],
    imports: [TableNoticiasComponent]
})
export class DashboardNoticiasComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
