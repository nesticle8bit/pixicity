import { IHttpFavoritosService } from 'src/app/services/interfaces/httpFavoritos.interface';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpLogsService } from 'src/app/services/interfaces/httpLogs.interface';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { MonitorViewModel } from 'src/app/models/logs/logs-vm.model';
import { MensajeViewModel } from 'src/app/models/mensajes/mensaje-vm.model';
import { FavoritosViewModel } from 'src/app/models/posts/post-vm.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { MensajesBadgeService } from 'src/app/services/shared/mensajes-badge.service';
import { MobileNavService } from 'src/app/services/shared/mobile-nav.service';
import { TemaService } from 'src/app/services/shared/tema.service';
import { debounceTime, merge } from 'rxjs';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { MatTooltip } from '@angular/material/tooltip';
import { ClickOutsideDirective } from '../../../shared/directives/clickOutside.directive';
import { NgClass, DatePipe } from '@angular/common';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { TipoIconMonitorComponent } from '../../addons/tipo-icon-monitor/tipo-icon-monitor.component';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
    selector: 'app-section-user-info-login',
    templateUrl: './section-user-info-login.component.html',
    styleUrls: ['./section-user-info-login.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatTooltip,
        ClickOutsideDirective,
        NgClass,
        UserAvatarComponent,
        TipoIconMonitorComponent,
        RouterLink,
        UserPopoverDirective,
        DatePipe,
        TimeAgoPipe,
        TruncatePipe,
    ],
})
export class SectionUserInfoLoginComponent implements OnInit {
  private securityService = inject(IHttpSecurityService);
  private favoritosService = inject(IHttpFavoritosService);
  private mensajesService = inject(IHttpMensajesService);
  private httpLogs = inject(IHttpLogsService);
  private signalrService = inject(SignalrService);
  private badgeService = inject(MensajesBadgeService);
  private toast = inject(NotificationService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  private readonly destroyRef = inject(DestroyRef);
  private readonly mobileNav = inject(MobileNavService);
  public readonly tema = inject(TemaService);

  public formGroup: FormGroup;
  public displayMenu: boolean = false;
  public currentUser: JwtUserModel = { usuario: undefined, token: '' };
  public display = {
    monitor: false,
    mensajes: false,
    favoritos: false,
  };
  public favoritos: FavoritosViewModel[] = [];
  public notificaciones: MonitorViewModel[] = [];
  public mensajes: MensajeViewModel[] = [];
  public currentStats = {
    notifications: 0,
    messages: 0,
  };

  constructor() {
    this.securityService
      .getCurrentUserAsObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: JwtUserModel) => {
        this.currentUser = value;
      });

    this.formGroup = this.formBuilder.group({
      search: '',
    });

    // Si se leyeron en otro lado (p. ej. al entrar a /monitor), el globo también se va.
    this.mobileNav.notificacionesLeidas$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => (this.currentStats.notifications = 0));
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
    // Al abrir el monitor el contador se va al instante (antes quedaba hasta recargar la página).
    if (this.currentStats.notifications > 0) {
      this.setNotificacionesAsReaded();
    }

    this.httpLogs.getLastNotificaciones().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        response = response.map((notificacion) => {
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

      if (this.currentStats.messages > 0) {
        this.currentStats.messages = 0;
        this.setMensajesAsReaded();
      }
    });
  }

  /** Enlaza el texto al destino real del aviso: post, shout o el enlace guardado (fotos, temas). Sin destino queda como texto. */
  setURL(notificacion: MonitorViewModel, text: string, comentarioId?: number | null): string {
    const ancla = comentarioId ? `#comentario-${comentarioId}` : '';
    const post = notificacion?.post;
    if (post?.id)
      return `<a href="/posts/${post.categoria?.seo}/${post.id}/${post.url}${ancla}" title="${post.titulo ?? ''}">${text}</a>`;
    if (notificacion?.shoutId && notificacion.shoutAutor)
      return `<a href="/shouts/${notificacion.shoutAutor}/${notificacion.shoutId}${ancla}">${text}</a>`;
    if (notificacion?.enlace) return `<a href="${notificacion.enlace}">${text}</a>`;
    return text;
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
    this.currentStats.notifications = 0;
    this.mobileNav.marcarNotificacionesLeidas();
  }

  setMensajesAsReaded(): void {
    this.mensajesService
      .setMensajesAsReaded()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.badgeService.refresh(), error: () => {} });
  }
}
