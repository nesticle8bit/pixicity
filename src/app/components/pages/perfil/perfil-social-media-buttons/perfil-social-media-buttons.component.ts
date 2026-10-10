import { Subscription } from 'rxjs';
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
  private cargaGetSocialMedia?: Subscription;

  private _usuarioId: number | null | undefined;

  @Input() set usuarioId(value: number | null | undefined) {
    this._usuarioId = value;

    if (value) {
      this.getSocialMedia();
    }
  }

  get usuarioId(): number | null | undefined {
    return this._usuarioId;
  }

  public socialMedia: any;

  ngOnInit(): void {}

  getSocialMedia(): void {
    if (!this.usuarioId) {
      return;
    }

    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.

    this.cargaGetSocialMedia?.unsubscribe();

    this.cargaGetSocialMedia = this.usuarioPerfilService
      .getSocialMediaByUsuarioId(this.usuarioId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.socialMedia = value;
      });
  }
}
