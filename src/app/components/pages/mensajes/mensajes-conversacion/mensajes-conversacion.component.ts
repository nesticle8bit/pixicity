import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-mensajes-conversacion',
  templateUrl: './mensajes-conversacion.component.html',
  styleUrls: ['./mensajes-conversacion.component.scss'],
})
export class MensajesConversacionComponent implements OnInit {
  public mensaje: any;
  public id: number = 0;
  public responder = false;
  public respuesta: string = '';

  constructor(
    private displayService: DisplayComponentService,
    private mensajesService: IHttpMensajesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.activatedRoute.paramMap.subscribe((value: any) => {
      this.id = value.get('id');
    });

    this.getMensajePrivadoById();
  }

  ngOnInit(): void {
    this.displaySections();
  }

  displaySections(): void {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });
  }

  getMensajePrivadoById(): void {
    this.mensajesService
      .getMensajePrivadoById(this.id)
      .subscribe((value: any) => {
        this.mensaje = value;
      });
  }

  responderMensaje(): void {
    if (!this.respuesta) {
      return;
    }

    const mp = {
      aUserName: this.mensaje.usuarioDe.userName,
      asunto: `RE: ${this.mensaje.asunto}`,
      contenido: this.respuesta.trim(),
    };

    this.mensajesService.sendMensajePrivado(mp).subscribe((response: any) => {
      if (response) {
        this.notificationService.success('La respuesta ha sido enviada correctamente', 'Respuesta Enviada');

        this.router.navigate(['/mensajes']);
      }
    });
  }
}
