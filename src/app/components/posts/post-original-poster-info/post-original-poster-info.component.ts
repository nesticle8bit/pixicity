import { Subscription } from 'rxjs';
import { UsuarioInfoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { UserPopoverCardComponent } from '../../addons/user-popover-card/user-popover-card.component';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';

@Component({
    selector: 'app-post-original-poster-info',
    templateUrl: './post-original-poster-info.component.html',
    styleUrls: ['./post-original-poster-info.component.scss'],
    imports: [UserPopoverCardComponent],
})
export class PostOriginalPosterInfoComponent implements OnInit {
  private securityService = inject(IHttpSecurityService);
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);

  private readonly destroyRef = inject(DestroyRef);
  private cargaGetUsuarioInfo?: Subscription;

  private _userName = '';

  @Input() set userName(value: string) {
    this._userName = value;

    if (value) {
      this.getUsuarioInfo(value);
    }
  }

  get userName(): string {
    return this._userName;
  }

  public info?: UsuarioInfoViewModel;
  public currentUser?: JwtUserModel;

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  getUsuarioInfo(userName: string): void {
    if (!userName) {
      return;
    }

    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.

    this.cargaGetUsuarioInfo?.unsubscribe();

    this.cargando = true;
    this.cargaGetUsuarioInfo = this.usuarioPerfilService.getUsuarioInfo(userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if (response) this.info = response;
        this.cargando = false;
      },
      error: () => (this.cargando = false),
    });
    // "En línea": los minutos desde la última actividad, igual que el popover.
    this.cargaEstado?.unsubscribe();
    this.cargaEstado = this.usuarioPerfilService.getUserStatus(userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (minutos) => (this.activo = minutos ?? null),
      error: () => (this.activo = null),
    });
  }

  public cargando = true;
  public activo: number | null = null;
  private cargaEstado?: Subscription;

}
