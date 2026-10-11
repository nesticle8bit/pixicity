import { Component, Input } from '@angular/core';
import { PerfilRef, SIN_PERFIL } from 'src/app/models/seguridad/seguridad-vm.model';
import { ShoutComposerComponent } from '../../shared/shouts/shout-composer/shout-composer.component';
import { ProfileShoutsWallComponent } from '../profile-shouts-wall/profile-shouts-wall.component';

@Component({
  selector: 'app-profile-shouts',
  templateUrl: './profile-shouts.component.html',
  styleUrls: ['./profile-shouts.component.scss'],
  imports: [ShoutComposerComponent, ProfileShoutsWallComponent],
})
export class ProfileShoutsComponent {
  public reloadShouts = false;
  private _user: PerfilRef = SIN_PERFIL;

  @Input() set user(value: PerfilRef | null) {
    this._user = value ?? SIN_PERFIL;
  }

  get user(): PerfilRef {
    return this._user;
  }

  /** Al publicar, recarga el muro (el wall recarga cuando `load` pasa a true). */
  alPublicar(): void {
    this.reloadShouts = false;
    setTimeout(() => (this.reloadShouts = true));
  }
}
