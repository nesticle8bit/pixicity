import { DialogEnviarMPComponent } from 'src/app/components/dialogs/dialog-enviar-mp/dialog-enviar-mp.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdsByTypeComponent } from '../../../ads/ads-by-type/ads-by-type.component';

@Component({
    selector: 'app-mensajes-sidebar',
    templateUrl: './mensajes-sidebar.component.html',
    styleUrls: ['./mensajes-sidebar.component.scss'],
    imports: [RouterLink, AdsByTypeComponent],
})
export class MensajesSidebarComponent implements OnInit {
  private dialog = inject(MatDialog);


  ngOnInit(): void {}

  enviarMP(): void {
    this.dialog.open(DialogEnviarMPComponent, {
      width: '780px',
      disableClose: true,
      data: {},
    });
  }
}
