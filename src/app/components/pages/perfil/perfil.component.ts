import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpBloqueosService } from 'src/app/services/interfaces/httpBloqueos.interface';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { BloqueoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';

@Component({
  standalone: false,
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public display: DisplayComponentModel = { mainMenu: true, footer: true, searchFooter: true, submenu: false, background: ''};
  public currentUser: any = {};
  public loggedUser: any = {};
  public currentSelection = 'shouts';
  public bloqueoActivo: BloqueoViewModel | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private securityService: IHttpSecurityService,
    private bloqueosService: IHttpBloqueosService,
    private notificationService: NotificationService,
    private displayService: DisplayComponentService,
    private seoService: SEOService,
  ) {
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values: any) => {
      this.getUserByUserName(values.get('userName'));
    });

    this.loggedUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {
    this.displayService.setDisplay(this.display);
  }

  getUserByUserName(userName: string): void {
    this.securityService.getUserByUserName(userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      this.currentUser = value;
      this.display.background = this.currentUser.profileBackground;
      this.displayService.setDisplay(this.display);

      this.seoService.setSEO({
        title: `${this.currentUser.userName} - Perfil`,
        description: `Perfil de ${this.currentUser.userName} en Taringas. Mira sus posts, shouts, seguidores y actividad en la comunidad.`,
        type: 'profile',
        imageURL: this.currentUser.avatar || '',
        tags: [this.currentUser.userName, 'perfil', 'usuario', 'taringas'],
      });

      if (this.loggedUser && this.loggedUser.userName !== userName) {
        this.loadBloqueo(userName);
      }
    });
  }

  loadBloqueo(userName: string): void {
    this.bloqueosService.getBloqueoContraPerfil(userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (bloqueo) => this.bloqueoActivo = bloqueo,
      error: () => {}
    });
  }

  bloquearUsuario(): void {
    this.bloqueosService.bloquearUsuario(this.currentUser.userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (id) => {
        this.bloqueoActivo = { id, bloqueadoId: this.currentUser.id, userName: this.currentUser.userName, avatar: this.currentUser.avatar, fechaRegistro: new Date().toISOString() };
        this.notificationService.success(`${this.currentUser.userName} ha sido bloqueado`, 'Bloqueado');
      },
      error: () => {}
    });
  }

  desbloquearUsuario(): void {
    if (!this.bloqueoActivo) return;
    this.bloqueosService.desbloquearUsuario(this.bloqueoActivo.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success(`${this.currentUser.userName} ha sido desbloqueado`, 'Desbloqueado');
        this.bloqueoActivo = null;
      },
      error: () => {}
    });
  }

  selectedChanged(value: string): void {
    this.currentSelection = value;
  }
}
