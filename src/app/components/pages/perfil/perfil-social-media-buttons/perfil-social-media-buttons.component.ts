import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { MatTooltip } from '@angular/material/tooltip';
import { IHttpUsuarioPerfilService } from '../../../../services/interfaces/httpUsuarioPerfil.interface';

@Component({
    selector: 'app-perfil-social-media-buttons',
    templateUrl: './perfil-social-media-buttons.component.html',
    styleUrls: ['./perfil-social-media-buttons.component.scss'],
    imports: [MatTooltip],
})
export class PerfilSocialMediaButtonsComponent implements OnInit {
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);

  private readonly destroyRef = inject(DestroyRef);

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

  ngOnInit(): void {}

  getSocialMedia(): void {
    this.usuarioPerfilService
      .getSocialMediaByUsuarioId(this.usuarioId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.socialMedia = value;
      });
  }
}
