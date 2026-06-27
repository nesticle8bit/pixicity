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
import { DashboardDenunciasComunidadComponent } from '../../components/admin/control-de-comunidad/denuncias-comunidad/dashboard-denuncias-comunidad/dashboard-denuncias-comunidad.component';
import { DashboardDenunciasComentariosComponent } from '../../components/admin/control-de-contenido/denuncias-comentarios/dashboard-denuncias-comentarios/dashboard-denuncias-comentarios.component';
import { DashboardAdsComponent } from '../../components/admin/general/publicidad/dashboard-ads/dashboard-ads.component';
import { DashboardCommentsComponent } from '../../components/admin/control-de-contenido/comentarios/dashboard-comments/dashboard-comments.component';
import { DashboardPaisesComponent } from '../../components/admin/control-de-contenido/paises/dashboard-paises/dashboard-paises.component';
import { DashboardSesionesComponent } from '../../components/admin/usuarios/sesiones/dashboard-sesiones/dashboard-sesiones.component';
import { DashboardReportesComponent } from '../../components/admin/control-de-comunidad/reportes/dashboard-reportes/dashboard-reportes.component';
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

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'dashboard', component: DashboardAdminComponent },
      { path: 'configuracion', component: DashboardConfigurationComponent },
      { path: 'posts', component: DashboardPostsComponent },
      { path: 'fotos', component: DashboardFotosComponent },
      { path: 'censuras', component: DashboardCensurasComponent },
      { path: 'afiliados', component: DashboardAfiliadosComponent },
      { path: 'categorias', component: DashboardCategoriasComponent },
      { path: 'comunidades-categorias', component: DashboardComunidadesComponent },
      { path: 'comunidades-denuncias', component: DashboardDenunciasComunidadComponent },
      { path: 'comentarios-denuncias', component: DashboardDenunciasComentariosComponent },
      { path: 'publicidad', component: DashboardAdsComponent },
      { path: 'comentarios', component: DashboardCommentsComponent },
      { path: 'paises', component: DashboardPaisesComponent },
      { path: 'sesiones', component: DashboardSesionesComponent },
      { path: 'denuncias', component: DashboardReportesComponent },
      { path: 'usuarios', component: DashboardUsuariosComponent },
      { path: 'rango-usuarios', component: DashboardRangosComponent },
      { path: 'shouts', component: DashboardShoutsComponent },
      { path: 'estadisticas', component: DashboardEstadisticasComponent },
      { path: 'noticias', component: DashboardNoticiasComponent },
      { path: 'monitor', component: DashboardMonitorComponent },
      { path: 'contacto', component: DashboardContactosComponent },
      { path: 'votos', component: DashboardVotosComponent },
      { path: 'paginas', component: DashboardPaginasComponent },
      { path: 'mensajes', component: DashboardMensajesComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
