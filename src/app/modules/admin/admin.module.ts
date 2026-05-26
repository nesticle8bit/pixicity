import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

// Third-party

import { NgSelectModule } from '@ng-select/ng-select';

// Admin components — control-de-comunidad
import { DashboardAfiliadosComponent } from '../../components/admin/control-de-comunidad/afiliados/dashboard-afiliados/dashboard-afiliados.component';
import { DialogUpdateAfiliadosComponent } from '../../components/admin/control-de-comunidad/afiliados/dialog-update-afiliados/dialog-update-afiliados.component';
import { TableAfiliadosComponent } from '../../components/admin/control-de-comunidad/afiliados/table-afiliados/table-afiliados.component';
import { DashboardCategoriasComponent } from '../../components/admin/control-de-comunidad/categorias/dashboard-categorias/dashboard-categorias.component';
import { DialogCreateUpdateCategoriasComponent } from '../../components/admin/control-de-comunidad/categorias/dialog-create-update-categorias/dialog-create-update-categorias.component';
import { TableCategoriasComponent } from '../../components/admin/control-de-comunidad/categorias/table-categorias/table-categorias.component';
import { DashboardEstadisticasComponent } from '../../components/admin/control-de-comunidad/estadisticas/dashboard-estadisticas/dashboard-estadisticas.component';
import { DashboardReportesComponent } from '../../components/admin/control-de-comunidad/reportes/dashboard-reportes/dashboard-reportes.component';
import { DialogVerReporteComponent } from '../../components/admin/control-de-comunidad/reportes/dialog-ver-reporte/dialog-ver-reporte.component';
import { TableReportesComponent } from '../../components/admin/control-de-comunidad/reportes/table-reportes/table-reportes.component';
import { DashboardVotosComponent } from '../../components/admin/control-de-comunidad/votos/dashboard-votos/dashboard-votos.component';
import { TableVotosComponent } from '../../components/admin/control-de-comunidad/votos/table-votos/table-votos.component';

// Admin components — control-de-contenido
import { DashboardCommentsComponent } from '../../components/admin/control-de-contenido/comentarios/dashboard-comments/dashboard-comments.component';
import { TableCommentsComponent } from '../../components/admin/control-de-contenido/comentarios/table-comments/table-comments.component';
import { DashboardContactosComponent } from '../../components/admin/control-de-contenido/contactos/dashboard-contactos/dashboard-contactos.component';
import { TableContactosComponent } from '../../components/admin/control-de-contenido/contactos/table-contactos/table-contactos.component';
import { DashboardMensajesComponent } from '../../components/admin/control-de-contenido/mensajes/dashboard-mensajes/dashboard-mensajes.component';
import { TableMensajesComponent } from '../../components/admin/control-de-contenido/mensajes/table-mensajes/table-mensajes.component';
import { DashboardMonitorComponent } from '../../components/admin/control-de-contenido/monitor/dashboard-monitor/dashboard-monitor.component';
import { TableMonitorComponent } from '../../components/admin/control-de-contenido/monitor/table-monitor/table-monitor.component';
import { DashboardNoticiasComponent } from '../../components/admin/control-de-contenido/noticias/dashboard-noticias/dashboard-noticias.component';
import { DialogCreateUpdateNoticiasComponent } from '../../components/admin/control-de-contenido/noticias/dialog-create-update-noticias/dialog-create-update-noticias.component';
import { TableNoticiasComponent } from '../../components/admin/control-de-contenido/noticias/table-noticias/table-noticias.component';
import { DashboardPaginasComponent } from '../../components/admin/control-de-contenido/paginas/dashboard-paginas/dashboard-paginas.component';
import { DialogCreateUpdatePaginasComponent } from '../../components/admin/control-de-contenido/paginas/dialog-create-update-paginas/dialog-create-update-paginas.component';
import { TablePaginasComponent } from '../../components/admin/control-de-contenido/paginas/table-paginas/table-paginas.component';
import { DashboardPaisesComponent } from '../../components/admin/control-de-contenido/paises/dashboard-paises/dashboard-paises.component';
import { DialogUpdatePaisesComponent } from '../../components/admin/control-de-contenido/paises/dialog-update-paises/dialog-update-paises.component';
import { TablePaisesComponent } from '../../components/admin/control-de-contenido/paises/table-paises/table-paises.component';
import { DashboardPostsComponent } from '../../components/admin/control-de-contenido/posts/dashboard-posts/dashboard-posts.component';
import { TablePostsComponent } from '../../components/admin/control-de-contenido/posts/table-posts/table-posts.component';
import { DashboardShoutsComponent } from '../../components/admin/control-de-contenido/shouts/dashboard-shouts/dashboard-shouts.component';
import { TableShoutsComponent } from '../../components/admin/control-de-contenido/shouts/table-shouts/table-shouts.component';

// Admin components — dashboard
import { DashboardComponent } from '../../components/admin/dashboard/dashboard.component';
import { DashboardAdminComponent } from '../../components/admin/dashboard-admin/dashboard-admin.component';
import { DashboardSidebarComponent } from '../../components/admin/dashboard-sidebar/dashboard-sidebar.component';

// Admin components — general
import { DashboardConfigurationComponent } from '../../components/admin/general/configuration/dashboard-configuration/dashboard-configuration.component';
import { DashboardAdsComponent } from '../../components/admin/general/publicidad/dashboard-ads/dashboard-ads.component';

// Admin components — usuarios
import { DashboardRangosComponent } from '../../components/admin/usuarios/rangos/dashboard-rangos/dashboard-rangos.component';
import { DialogRangosChangesReportComponent } from '../../components/admin/usuarios/rangos/dialog-rangos-changes-report/dialog-rangos-changes-report.component';
import { TableRangosComponent } from '../../components/admin/usuarios/rangos/table-rangos/table-rangos.component';
import { DashboardSesionesComponent } from '../../components/admin/usuarios/sesiones/dashboard-sesiones/dashboard-sesiones.component';
import { TableSesionesComponent } from '../../components/admin/usuarios/sesiones/table-sesiones/table-sesiones.component';
import { DashboardUsuariosComponent } from '../../components/admin/usuarios/usuarios/dashboard-usuarios/dashboard-usuarios.component';

import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  declarations: [
    // control-de-comunidad
    DashboardAfiliadosComponent,
    DialogUpdateAfiliadosComponent,
    TableAfiliadosComponent,
    DashboardCategoriasComponent,
    DialogCreateUpdateCategoriasComponent,
    TableCategoriasComponent,
    DashboardEstadisticasComponent,
    DashboardReportesComponent,
    DialogVerReporteComponent,
    TableReportesComponent,
    DashboardVotosComponent,
    TableVotosComponent,
    // control-de-contenido
    DashboardCommentsComponent,
    TableCommentsComponent,
    DashboardContactosComponent,
    TableContactosComponent,
    DashboardMensajesComponent,
    TableMensajesComponent,
    DashboardMonitorComponent,
    TableMonitorComponent,
    DashboardNoticiasComponent,
    DialogCreateUpdateNoticiasComponent,
    TableNoticiasComponent,
    DashboardPaginasComponent,
    DialogCreateUpdatePaginasComponent,
    TablePaginasComponent,
    DashboardPaisesComponent,
    DialogUpdatePaisesComponent,
    TablePaisesComponent,
    DashboardPostsComponent,
    TablePostsComponent,
    DashboardShoutsComponent,
    TableShoutsComponent,
    // dashboard
    DashboardComponent,
    DashboardAdminComponent,
    DashboardSidebarComponent,
    // general
    DashboardConfigurationComponent,
    DashboardAdsComponent,
    // usuarios (BanearUsuario, ChangeAvatar, ChangeRango, TableUsuarios → SharedModule)
    DashboardRangosComponent,
    DialogRangosChangesReportComponent,
    TableRangosComponent,
    DashboardSesionesComponent,
    TableSesionesComponent,
    DashboardUsuariosComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Material
    MatButtonModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatDialogModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatMenuModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatBottomSheetModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    // Third-party
    NgSelectModule,
    // Shared
    SharedModule,
    // Routing
    AdminRoutingModule,
  ],
})
export class AdminModule {}
