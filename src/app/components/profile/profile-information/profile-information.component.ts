import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DatePipe } from '@angular/common';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';

@Component({
    selector: 'app-profile-information',
    templateUrl: './profile-information.component.html',
    styleUrls: ['./profile-information.component.scss'],
    imports: [DatePipe],
})
export class ProfileInformationComponent implements OnInit {
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);

  private readonly destroyRef = inject(DestroyRef);

  private _user: any;

  @Input() set user(value: any) {
    this._user = value;

    if (value) {
    }
  }

  get user(): any {
    return this._user;
  }

  public perfil: any;
  public userInformation: any = {};

  ngOnInit(): void {
    this.getCurrentPerfilInfo();
  }

  getCurrentPerfilInfo(): void {
    if (!this.user.id) {
      return;
    }

    this.usuarioPerfilService
      .getPerfilInfoByUserId(this.user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response) {
          this.perfil = response;
        }
      });
  }
}
