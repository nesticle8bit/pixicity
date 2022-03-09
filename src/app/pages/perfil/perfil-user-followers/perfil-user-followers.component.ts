import { Component, Input, OnInit } from '@angular/core';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-perfil-user-followers',
  templateUrl: './perfil-user-followers.component.html',
  styleUrls: ['./perfil-user-followers.component.scss'],
})
export class PerfilUserFollowersComponent implements OnInit {
  private _usuarioId: any;
  public followers: any[] = [];
  public totalCount: number = 0;

  @Input() set usuarioId(value: any) {
    this._usuarioId = value;

    if (value) {
      this.getSeguidores();
    }
  }

  get usuarioId(): any {
    return this._usuarioId;
  }

  constructor(private securityService: IHttpSecurityService) {}

  ngOnInit(): void {}

  getSeguidores(): void {
    if (!this._usuarioId) {
      return;
    }

    this.securityService
      .getLastFollowersByUserId(this._usuarioId)
      .subscribe((response: any) => {
        this.followers = response.followers;
        this.totalCount = response.totalCount;
      });
  }
}
