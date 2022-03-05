import { Component, Input, OnInit } from '@angular/core';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-profile-activity',
  templateUrl: './profile-activity.component.html',
  styleUrls: ['./profile-activity.component.scss'],
})
export class ProfileActivityComponent implements OnInit {
  private _user: any;

  @Input() set user(value: any) {
    this._user = value;

    if (value) {
      this.getActividadUsuario();
    }
  }

  get user(): any {
    return this._user;
  }

  public actividad: any;
  constructor(private securityService: IHttpSecurityService) {}

  ngOnInit(): void {}

  getActividadUsuario(): void {
    this.securityService
      .getActividadUsuario(this.user.id)
      .subscribe((response: any) => {
        console.log(response);
        this.actividad = response;
      });
  }
}
