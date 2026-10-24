import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from '../../components/admin/dashboard/dashboard.component';
import { DashboardAdminComponent } from '../../components/admin/dashboard-admin/dashboard-admin.component';
import { DashboardConfigurationComponent } from '../../components/admin/general/configuration/dashboard-configuration/dashboard-configuration.component';
import { DashboardPostsComponent } from '../../components/admin/control-de-contenido/posts/dashboard-posts/dashboard-posts.component';
import { DashboardFotosComponent } from '../../components/admin/control-de-contenido/fotos/dashboard-fotos/dashboard-fotos.component';
import { DashboardCensurasComponent } from '../../components/admin/control-de-contenido/censuras/dashboard-censuras/dashboard-censuras.component';
import { DashboardAfiliadosComponent } from '../../components/admin/control-de-comunidad/afiliados/dashboard-afiliados/dashboard-afiliados.component';
import { DashboardCategoriasComponent } from '../../components/admin/control-de-comunidad/categorias/dashboard-categorias/dashboard-categorias.component';
import { DashboardComunidadesComponent } from '../../components/admin/control-de-comunidad/comunidades/dashboard-comunidades/dashboard-comunidades.component';
import { DashboardModeracionComponent } from '../../components/admin/control-de-contenido/moderacion/dashboard-moderacion/dashboard-moderacion.component';
import { DashboardAdsComponent } from '../../components/admin/general/publicidad/dashboard-ads/dashboard-ads.component';
import { DashboardCommentsComponent } from '../../components/admin/control-de-contenido/comentarios/dashboard-comments/dashboard-comments.component';
import { DashboardPaisesComponent } from '../../components/admin/control-de-contenido/paises/dashboard-paises/dashboard-paises.component';
import { DashboardSesionesComponent } from '../../components/admin/usuarios/sesiones/dashboard-sesiones/dashboard-sesiones.component';
import { DashboardUsuariosComponent } from '../../components/admin/usuarios/usuarios/dashboard-usuarios/dashboard-usuarios.component';
import { DashboardRangosComponent } from '../../components/admin/usuarios/rangos/dashboard-rangos/dashboard-rangos.component';
import { DashboardShoutsComponent } from '../../components/admin/control-de-contenido/shouts/dashboard-shouts/dashboard-shouts.component';
import { DashboardEstadisticasComponent } from '../../components/admin/control-de-comunidad/estadisticas/dashboard-estadisticas/dashboard-estadisticas.component';
import { DashboardNoticiasComponent } from '../../components/admin/control-de-contenido/noticias/dashboard-noticias/dashboard-noticias.component';
import { DashboardMonitorComponent } from '../../components/admin/control-de-contenido/monitor/dashboard-monitor/dashboard-monitor.component';
import { DashboardContactosComponent } from '../../components/admin/control-de-contenido/contactos/dashboard-contactos/dashboard-contactos.component';
import { DashboardVotosComponent } from '../../components/admin/control-de-comunidad/votos/dashboard-votos/dashboard-votos.component';
import { DashboardPaginasComponent } from '../../components/admin/control-de-contenido/paginas/dashboard-paginas/dashboard-paginas.component';
import { DashboardMensajesComponent } from '../../components/admin/control-de-contenido/mensajes/dashboard-mensajes/dashboard-mensajes.component';
import { DashboardLogsComponent } from '../../components/admin/general/logs/dashboard-logs/dashboard-logs.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardAdminComponent, title: 'Panel · Administración' },
      { path: 'configuracion', component: DashboardConfigurationComponent, title: 'Configuración · Administración' },
      { path: 'logs', component: DashboardLogsComponent, title: 'Logs · Administración' },
      { path: 'posts', component: DashboardPostsComponent, title: 'Posts · Administración' },
      { path: 'fotos', component: DashboardFotosComponent, title: 'Fotos · Administración' },
      { path: 'censuras', component: DashboardCensurasComponent, title: 'Censuras · Administración' },
      { path: 'afiliados', component: DashboardAfiliadosComponent, title: 'Afiliados · Administración' },
      { path: 'categorias', component: DashboardCategoriasComponent, title: 'Categorías · Administración' },
      { path: 'comunidades-categorias', component: DashboardComunidadesComponent, title: 'Categorías de comunidades · Administración' },
      { path: 'publicidad', component: DashboardAdsComponent, title: 'Publicidad · Administración' },
      { path: 'comentarios', component: DashboardCommentsComponent, title: 'Comentarios · Administración' },
      { path: 'paises', component: DashboardPaisesComponent, title: 'Países · Administración' },
      { path: 'sesiones', component: DashboardSesionesComponent, title: 'Sesiones · Administración' },
      { path: 'moderacion', component: DashboardModeracionComponent, title: 'Reportes · Administración' },
      // Las páginas de denuncias por tipo leían tablas que ya no reciben denuncias: todo está en el panel de moderación.
      { path: 'denuncias', redirectTo: 'moderacion' },
      { path: 'comentarios-denuncias', redirectTo: 'moderacion' },
      { path: 'comunidades-denuncias', redirectTo: 'moderacion' },
      { path: 'shouts-denuncias', redirectTo: 'moderacion' },
      { path: 'usuarios', component: DashboardUsuariosComponent, title: 'Usuarios · Administración' },
      { path: 'rango-usuarios', component: DashboardRangosComponent, title: 'Rangos · Administración' },
      { path: 'shouts', component: DashboardShoutsComponent, title: 'Shouts · Administración' },
      { path: 'estadisticas', component: DashboardEstadisticasComponent, title: 'Estadísticas · Administración' },
      { path: 'noticias', component: DashboardNoticiasComponent, title: 'Noticias · Administración' },
      { path: 'monitor', component: DashboardMonitorComponent, title: 'Monitor · Administración' },
      { path: 'contacto', component: DashboardContactosComponent, title: 'Contacto · Administración' },
      { path: 'votos', component: DashboardVotosComponent, title: 'Votos · Administración' },
      { path: 'paginas', component: DashboardPaginasComponent, title: 'Páginas · Administración' },
      { path: 'mensajes', component: DashboardMensajesComponent, title: 'Mensajes · Administración' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
