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

  private _userName: any;

  @Input() set userName(value: any) {
    this._userName = value;

    if (value) {
      this.getUserStatus(value);
    }
  }

  get userName(): any {
    return this._userName ? this._userName : '';
  }

  readonly class = input<string>('');

  public activo: number = 0;

  ngOnInit(): void {}

  getUserStatus(userName: string): void {
    this.usuarioPerfilService.getUserStatus(userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.activo = response ?? 0;
    });
  }
}
