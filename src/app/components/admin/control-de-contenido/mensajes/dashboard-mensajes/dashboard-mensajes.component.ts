import { Component, OnInit } from '@angular/core';
import { TableMensajesComponent } from '../table-mensajes/table-mensajes.component';

@Component({
    selector: 'app-dashboard-mensajes',
    templateUrl: './dashboard-mensajes.component.html',
    styleUrls: ['./dashboard-mensajes.component.scss'],
    imports: [TableMensajesComponent]
})
export class DashboardMensajesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
