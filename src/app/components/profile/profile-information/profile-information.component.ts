import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-profile-information',
  templateUrl: './profile-information.component.html',
  styleUrls: ['./profile-information.component.scss'],
})
export class ProfileInformationComponent implements OnInit {
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

  constructor(
    private securityService: IHttpSecurityService
  ) {
  }

  ngOnInit(): void {
    this.getCurrentPerfilInfo();
  }

  getCurrentPerfilInfo(): void {
    this.securityService.getCurrentPerfilInfo().subscribe((response: any) => {
      if(response) {
        this.perfil = response;
      }
    });
  }
}
