import { Subscription } from 'rxjs';
import { Component, DestroyRef, inject, Input, OnInit, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';

@Component({
    selector: 'app-user-online-status',
    templateUrl: './user-online-status.component.html',
    styleUrls: ['./user-online-status.component.scss'],
    imports: [NgClass, MatTooltip],
})
export class UserOnlineStatusComponent implements OnInit {
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);

  private readonly destroyRef = inject(DestroyRef);
  private cargaGetUserStatus?: Subscription;

  private _userName: string | null | undefined;

  @Input() set userName(value: string | null | undefined) {
    this._userName = value;

    if (value) {
      this.getUserStatus(value);
    }
  }

  get userName(): string | null | undefined {
    return this._userName ? this._userName : '';
  }

  readonly class = input<string>('');

  public activo: number = 0;

  ngOnInit(): void {}

  getUserStatus(userName: string): void {
    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.

    this.cargaGetUserStatus?.unsubscribe();

    this.cargaGetUserStatus = this.usuarioPerfilService.getUserStatus(userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.activo = response ?? 0;
    });
  }
}
