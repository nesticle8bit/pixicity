import { Component } from '@angular/core';
import { TableUsuariosComponent } from '../../admin/usuarios/usuarios/table-usuarios/table-usuarios.component';

/** La tabla de usuarios del panel admin, sin las acciones que el API reserva a administradores. */
@Component({
  selector: 'app-moderacion-usuarios',
  template: `<h1 class="dashboard--title">Usuarios</h1>
    <app-table-usuarios modo="moderacion" />`,
  imports: [TableUsuariosComponent],
})
export class ModeracionUsuariosComponent {}
