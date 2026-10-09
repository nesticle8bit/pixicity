import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BloqueoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { IHttpBloqueosService } from 'src/app/services/interfaces/httpBloqueos.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { UserAvatarComponent } from '../../../addons/user-avatar/user-avatar.component';

/** Cuenta > Bloqueados: usuarios que bloqueé, con opción de desbloquear. */
@Component({
  selector: 'app-account-bloqueados',
  templateUrl: './account-bloqueados.component.html',
  imports: [RouterLink, MatButton, MatIcon, UserAvatarComponent],
})
export class AccountBloqueadosComponent implements OnInit {
  private bloqueosService = inject(IHttpBloqueosService);
  private notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  public bloqueados: BloqueoViewModel[] = [];

  ngOnInit(): void {
    this.bloqueosService.getBloqueados().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => (this.bloqueados = data),
      error: () => {},
    });
  }

  desbloquearUsuario(bloqueo: BloqueoViewModel): void {
    this.bloqueosService.desbloquearUsuario(bloqueo.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.bloqueados = this.bloqueados.filter((b) => b.id !== bloqueo.id);
        this.notificationService.success(`${bloqueo.userName} ha sido desbloqueado`, 'Desbloqueado');
      },
      error: () => {},
    });
  }
}
