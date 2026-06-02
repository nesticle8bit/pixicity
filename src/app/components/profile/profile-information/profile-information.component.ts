import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  standalone: false,
  selector: 'app-profile-information',
  templateUrl: './profile-information.component.html',
  styleUrls: ['./profile-information.component.scss'],
})
export class ProfileInformationComponent implements OnInit {
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

  constructor(private securityService: IHttpSecurityService) {}

  ngOnInit(): void {
    this.getCurrentPerfilInfo();
  }

  getCurrentPerfilInfo(): void {
    if (!this.user.id) {
      return;
    }

    this.securityService
      .getPerfilInfoByUserId(this.user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (response) {
          this.perfil = response;
        }
      });
  }
}
