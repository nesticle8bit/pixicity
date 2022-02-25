import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpFavoritosService } from 'src/app/services/interfaces/httpFavoritos.interface';
import { IHttpLogsService } from 'src/app/services/interfaces/httpLogs.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

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
    favoritos: false,
  };
  public favoritos: any[] = [];
  public notificaciones: any[] = [];
  public currentStats = {
    notifications: 0,
    messages: 0,
  };

  constructor(
    private securityService: IHttpSecurityService,
    private favoritosService: IHttpFavoritosService,
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
              `tu <a href="/posts/${notificacion?.post?.categoria?.seo}/${notificacion.post?.id}/${notificacion.post?.url}">post</a>`
            );
          }

          return notificacion;
        });
      }

      this.notificaciones = response;
    });

    this.display.monitor = !this.display.monitor;
  }

  verFavoritos(): void {
    this.favoritosService.getLastFavoritos(5).subscribe((response: any) => {
      if (response) {
        response = response.map((fav: any) => {
          fav.post.url = fav.post.titulo.toLowerCase().replace(/\s/g, '-');
          return fav;
        });
      }

      this.favoritos = response;
    });

    this.display.favoritos = !this.display.favoritos;
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
}
