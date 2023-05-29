import { IHttpFavoritosService } from 'src/app/services/interfaces/httpFavoritos.interface';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpLogsService } from 'src/app/services/interfaces/httpLogs.interface';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-section-user-info-login',
  templateUrl: './section-user-info-login.component.html',
  styleUrls: ['./section-user-info-login.component.scss'],
})
export class SectionUserInfoLoginComponent implements OnInit {
  public formGroup: FormGroup;
  public displayMenu: boolean = false;
  public currentUser: JwtUserModel = { usuario: undefined, token: '' };
  public display = {
    monitor: false,
    mensajes: false,
    favoritos: false,
  };
  public favoritos: any[] = [];
  public notificaciones: any[] = [];
  public mensajes: any[] = [];
  public currentStats = {
    notifications: 0,
    messages: 0,
  };

  constructor(
    private securityService: IHttpSecurityService,
    private favoritosService: IHttpFavoritosService,
    private mensajesService: IHttpMensajesService,
    private httpLogs: IHttpLogsService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.securityService
      .getCurrentUserAsObservable()
      .subscribe((value: JwtUserModel) => {
        this.currentUser = value;
      });

    this.formGroup = this.formBuilder.group({
      search: '',
    });
  }

  ngOnInit(): void {
    this.getStats();
  }

  getStats(): void {
    if (!this.currentUser?.usuario) {
      return;
    }

    this.httpLogs.getStats().subscribe((value: any) => {
      this.currentStats.notifications = value.notifications;
      this.currentStats.messages = value.messages;
    });
  }

  verNotificaciones(): void {
    this.httpLogs.getLastNotificaciones().subscribe((response: any) => {
      if (response) {
        response = response.map((notificacion: any) => {
          if (notificacion.mensaje) {
            notificacion.mensaje = notificacion.mensaje.replace(
              'tu post',
              `tu ${this.setURL(notificacion, 'post')}`
            );
            notificacion.mensaje = notificacion.mensaje.replace(
              'post que sigues',
              `${this.setURL(notificacion, 'post que sigues')}`
            );
            notificacion.mensaje = notificacion.mensaje.replace(
              'un post',
              `un ${this.setURL(notificacion, 'post')}`
            );
            notificacion.mensaje = notificacion.mensaje.replace(
              'en tu perfil',
              `en tu ${this.setProfile('perfil')}`
            );
            notificacion.mensaje = notificacion.mensaje.replace(
              'nuevo Post',
              `nuevo ${this.setURL(notificacion, 'Post')}`
            );
            notificacion.mensaje = notificacion.mensaje.replace(
              'tu comentario',
              `tu ${this.setURL(notificacion, 'comentario')}`
            );
          }

          return notificacion;
        });

        this.setNotificacionesAsReaded();
      }

      this.notificaciones = response;
    });

    this.display.monitor = true;
    this.display.mensajes = false;
    this.display.favoritos = false;
  }

  verMensajes(): void {
    this.display.mensajes = !this.display.mensajes;
    this.display.favoritos = false;
    this.display.monitor = false;

    this.mensajesService.getLastMensajes().subscribe((response: any) => {
      this.mensajes = response;

      this.setMensajesAsReaded();
    });
  }

  setURL(notificacion: any, text: string): string {
    return `<a href="/posts/${notificacion?.post?.categoria?.seo}/${notificacion.post?.id}/${notificacion.post?.url}" title="${notificacion?.post?.titulo}">${text}</a>`;
  }

  setProfile(text: string): string {
    return `<a href='/perfil/${this.currentUser.usuario.userName}'>${text}</a>`;
  }

  verFavoritos(): void {
    this.favoritosService.getLastFavoritos(5).subscribe((response: any) => {
      this.favoritos = response;
    });

    this.display.favoritos = !this.display.favoritos;
    this.display.mensajes = false;
    this.display.monitor = false;
  }

  cerrarSesion(): void {
    this.securityService.logout();
    window.location.href = '';
  }

  buscar(): void {
    const obj = Object.assign({}, this.formGroup.value);

    if (!obj?.search) {
      return;
    }

    this.router.navigate([`/buscar/posts/${obj.search}`]);
  }

  setNotificacionesAsReaded(): void {
    this.httpLogs.setNotificacionesAsReaded().subscribe((response: any) => {
      console.log(
        '🔔 Se ha cambiado el estado de las últimas notificaciones a leído'
      );
    });
  }

  setMensajesAsReaded(): void {
    this.mensajesService.setMensajesAsReaded().subscribe((response: any) => {
      console.log(
        '🔔 Se ha cambiado el estado de los últimos mensajes a leído'
      );
    });
  }
}
