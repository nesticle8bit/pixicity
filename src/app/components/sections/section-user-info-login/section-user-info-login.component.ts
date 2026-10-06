import { IHttpFavoritosService } from 'src/app/services/interfaces/httpFavoritos.interface';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpLogsService } from 'src/app/services/interfaces/httpLogs.interface';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { MensajesBadgeService } from 'src/app/services/shared/mensajes-badge.service';
import { debounceTime, merge } from 'rxjs';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-section-user-info-login',
  templateUrl: './section-user-info-login.component.html',
  styleUrls: ['./section-user-info-login.component.scss'],
})
export class SectionUserInfoLoginComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

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
    private signalrService: SignalrService,
    private badgeService: MensajesBadgeService,
    private toast: NotificationService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.securityService
      .getCurrentUserAsObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: JwtUserModel) => {
        this.currentUser = value;
      });

    this.formGroup = this.formBuilder.group({
      search: '',
    });
  }

  // Esc cierra cualquier desplegable abierto (monitor, mensajes, favoritos).
  @HostListener('document:keydown.escape')
  cerrarDesplegables(): void {
    this.display.monitor = false;
    this.display.mensajes = false;
    this.display.favoritos = false;
  }

  ngOnInit(): void {
    this.getStats();
    this.iniciarRealtime();
  }

  private iniciarRealtime(): void {
    if (!this.currentUser?.usuario || !this.currentUser?.token) {
      return;
    }

    this.signalrService.start(this.currentUser.token);

    // Notificación en vivo: sube el contador y muestra un aviso discreto.
    this.signalrService.notification$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((payload) => {
        this.currentStats.notifications = (this.currentStats.notifications ?? 0) + 1;
        if (payload?.mensaje) {
          this.toast.info(payload.mensaje, 'Nueva notificación');
        }
      });

    // Contador de mensajes en vivo: un mensaje recibido o un chat abierto (que marca como leído) lo recalculan.
    // El debounce deja que el chat termine de marcar como leído antes de consultar el total.
    merge(this.signalrService.mensaje$, this.signalrService.mensajesLeidos$, this.badgeService.refresh$)
      .pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.getStats());
  }

  getStats(): void {
    if (!this.currentUser?.usuario) {
      return;
    }

    this.httpLogs.getStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.currentStats.notifications = value.notifications;
      this.currentStats.messages = value.messages;
    });
  }

  verNotificaciones(): void {
    this.httpLogs.getLastNotificaciones().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
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
            // Con comentarioId el enlace baja hasta el comentario y lo resalta (#comentario-{id}).
            notificacion.mensaje = notificacion.mensaje.replace(
              'tu comentario',
              `tu ${this.setURL(notificacion, 'comentario', notificacion.comentarioId)}`
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

    this.mensajesService.getLastMensajes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.mensajes = response;

      this.setMensajesAsReaded();
    });
  }

  setURL(notificacion: any, text: string, comentarioId?: number | null): string {
    const ancla = comentarioId ? `#comentario-${comentarioId}` : '';
    return `<a href="/posts/${notificacion?.post?.categoria?.seo}/${notificacion.post?.id}/${notificacion.post?.url}${ancla}" title="${notificacion?.post?.titulo}">${text}</a>`;
  }

  setProfile(text: string): string {
    return `<a href='/perfil/${this.currentUser.usuario?.userName ?? ''}'>${text}</a>`;
  }

  verFavoritos(): void {
    this.favoritosService.getLastFavoritos(5).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.favoritos = response;
    });

    this.display.favoritos = !this.display.favoritos;
    this.display.mensajes = false;
    this.display.monitor = false;
  }

  cerrarSesion(): void {
    this.signalrService.stop();
    this.securityService.logout();
    window.location.href = '';
  }

  buscar(): void {
    const obj = Object.assign({}, this.formGroup.value);

    if (!obj?.search) {
      return;
    }

    this.router.navigate(['/buscar', 'posts', obj.search]);
  }

  setNotificacionesAsReaded(): void {
    this.httpLogs.setNotificacionesAsReaded().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      console.log(
        '🔔 Se ha cambiado el estado de las últimas notificaciones a leído'
      );
    });
  }

  setMensajesAsReaded(): void {
    this.mensajesService.setMensajesAsReaded().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      console.log(
        '🔔 Se ha cambiado el estado de los últimos mensajes a leído'
      );
    });
  }
}
