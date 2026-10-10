import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UsuarioAvatarViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { UserAvatarComponent } from 'src/app/components/addons/user-avatar/user-avatar.component';

/** Lista de sugerencias de @menciones (la muestra MencionesDirective en un overlay junto al textarea). */
@Component({
  selector: 'app-menciones-lista',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserAvatarComponent],
  template: `
    <ul class="menciones" role="listbox" [id]="idLista()" aria-label="Usuarios para mencionar">
      @for (u of sugerencias(); track u.userName; let i = $index) {
      <li role="option" class="menciones__opcion" [id]="idLista() + '-' + i" [class.is-activa]="i === activa()"
        [attr.aria-selected]="i === activa()" (mousedown)="$event.preventDefault(); elegido.emit(u)">
        <app-user-avatar [avatar]="u.avatar" [userName]="u.userName" [width]="22" [height]="22"></app-user-avatar>
        <span>&#64;{{u.userName}}</span>
      </li>
      }
    </ul>
  `,
  styles: [`
    .menciones {
      list-style: none; margin: 0; padding: 4px; min-width: 220px; max-width: 300px; max-height: 260px; overflow-y: auto;
      background: #fff; border: 1px solid #e1e5e8; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.14);
    }
    .menciones__opcion {
      display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; cursor: pointer; font-size: 13px;
      &:hover, &.is-activa { background: #eef5f9; color: #006595; }
    }
  `],
})
export class MencionesListaComponent {
  readonly sugerencias = input<UsuarioAvatarViewModel[]>([]);
  readonly activa = input(0);
  readonly idLista = input('menciones');
  readonly elegido = output<UsuarioAvatarViewModel>();
}
