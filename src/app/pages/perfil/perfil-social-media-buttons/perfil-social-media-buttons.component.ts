import { Component, Input, OnInit } from '@angular/core';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-perfil-social-media-buttons',
  templateUrl: './perfil-social-media-buttons.component.html',
  styleUrls: ['./perfil-social-media-buttons.component.scss'],
})
export class PerfilSocialMediaButtonsComponent implements OnInit {
  private _usuarioId: any;

  @Input() set usuarioId(value: any) {
    this._usuarioId = value;

    if (value) {
      this.getSocialMedia();
    }
  }

  get usuarioId(): any {
    return this._usuarioId;
  }

  public socialMedia: any;

  constructor(private securityService: IHttpSecurityService) {}

  ngOnInit(): void {}

  getSocialMedia(): void {
    this.securityService
      .getSocialMediaByUsuarioId(this.usuarioId)
      .subscribe((value: any) => {
        this.socialMedia = value;
      });
  }
}
