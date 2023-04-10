import { DialogEnviarMPComponent } from 'src/app/components/dialogs/dialog-enviar-mp/dialog-enviar-mp.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mensajes-sidebar',
  templateUrl: './mensajes-sidebar.component.html',
  styleUrls: ['./mensajes-sidebar.component.scss'],
})
export class MensajesSidebarComponent implements OnInit {
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  enviarMP(): void {
    this.dialog.open(DialogEnviarMPComponent, {
      width: '780px',
      disableClose: true,
      data: {},
    });
  }
}
