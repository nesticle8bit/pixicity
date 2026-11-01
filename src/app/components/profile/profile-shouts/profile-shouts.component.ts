import { Component, Input, viewChild } from '@angular/core';
import { PerfilRef, SIN_PERFIL } from 'src/app/models/seguridad/seguridad-vm.model';
import { ShoutComposerComponent } from '../../shared/shouts/shout-composer/shout-composer.component';
import { ProfileTimelineComponent } from '../profile-timeline/profile-timeline.component';

/** Pestaña principal del perfil: escribir en el muro y la línea de tiempo con todo lo que hizo el usuario. */
@Component({
  selector: 'app-profile-shouts',
  templateUrl: './profile-shouts.component.html',
  styleUrls: ['./profile-shouts.component.scss'],
  imports: [ShoutComposerComponent, ProfileTimelineComponent],
})
export class ProfileShoutsComponent {
  private _user: PerfilRef = SIN_PERFIL;
  private readonly timeline = viewChild(ProfileTimelineComponent);

  @Input() set user(value: PerfilRef | null) {
    this._user = value ?? SIN_PERFIL;
  }

  get user(): PerfilRef {
    return this._user;
  }

  /** Al publicar, la línea de tiempo vuelve a cargar desde arriba. */
  alPublicar(): void {
    this.timeline()?.recargar();
  }
}
