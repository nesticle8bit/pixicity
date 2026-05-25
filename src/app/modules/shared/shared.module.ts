import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { RichEditorComponent } from '../../components/shared/rich-editor/rich-editor.component';
import { CountryFlagComponent } from '../../components/addons/country-flag/country-flag.component';
import { PostUrlLinkComponent } from '../../components/addons/post-url-link/post-url-link.component';
import { UserAvatarComponent } from '../../components/addons/user-avatar/user-avatar.component';
import { WhoIsIpComponent } from '../../components/addons/who-is-ip/who-is-ip.component';
import { TimeAgoPipe } from '../../shared/pipes/timeAgo.pipe';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { BanearUsuarioComponent } from '../../components/admin/usuarios/usuarios/banear-usuario/banear-usuario.component';
import { ChangeAvatarComponent } from '../../components/admin/usuarios/usuarios/change-avatar/change-avatar.component';
import { ChangeRangoComponent } from '../../components/admin/usuarios/rangos/change-rango/change-rango.component';
import { TableUsuariosComponent } from '../../components/admin/usuarios/usuarios/table-usuarios/table-usuarios.component';
import { UserPopoverCardComponent } from '../../components/addons/user-popover-card/user-popover-card.component';
import { UserPopoverDirective } from '../../shared/directives/userPopover.directive';

const SHARED = [
  // Rich editor
  RichEditorComponent,
  // Addons
  CountryFlagComponent,
  PostUrlLinkComponent,
  UserAvatarComponent,
  WhoIsIpComponent,
  // Pipes
  TimeAgoPipe,
  TruncatePipe,
  // Cross-context admin components
  BanearUsuarioComponent,
  ChangeAvatarComponent,
  ChangeRangoComponent,
  TableUsuariosComponent,
  // User popover
  UserPopoverCardComponent,
  UserPopoverDirective,
];

@NgModule({
  declarations: SHARED,
  imports: [
    CommonModule,
    RouterModule,
    OverlayModule,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatPaginatorModule,
    MatButtonModule,
    FontAwesomeModule,
  ],
  exports: SHARED,
})
export class SharedModule {}
