import { Component, OnInit } from '@angular/core';
import { TableVotosComponent } from '../table-votos/table-votos.component';

@Component({
    selector: 'app-dashboard-votos',
    templateUrl: './dashboard-votos.component.html',
    styleUrls: ['./dashboard-votos.component.scss'],
    imports: [TableVotosComponent]
})
export class DashboardVotosComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
