import { Component, OnInit } from '@angular/core';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpFavoritosService } from 'src/app/services/interfaces/httpFavoritos.interface';
import { IHttpLogsService } from 'src/app/services/interfaces/httpLogs.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-section-user-info-login',
  templateUrl: './section-user-info-login.component.html',
  styleUrls: ['./section-user-info-login.component.scss']
})
export class SectionUserInfoLoginComponent implements OnInit {
  public displayMenu: boolean = false;
  public currentUser: JwtUserModel = { usuario: undefined, token: '' };
  public display = {
    monitor: false,
    favoritos: false
  };
  public favoritos: any[] = [];
  public notificaciones: any[] = [];

  constructor(
    private securityService: IHttpSecurityService,
    private favoritosService: IHttpFavoritosService,
    private httpLogs: IHttpLogsService
  ) {
    this.securityService.getCurrentUserAsObservable().subscribe((value: JwtUserModel) => {
      this.currentUser = value;
    });
  }

  ngOnInit(): void {
  }

  verNotificaciones(): void {
    this.httpLogs.getLastNotificaciones().subscribe((response: any) => {
      this.notificaciones = response;
    });

    this.display.monitor = !this.display.monitor;
  }

  verFavoritos(): void {
    this.favoritosService.getLastFavoritos(5).subscribe((response: any) => {
      if(response) {
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
}
