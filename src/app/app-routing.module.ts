import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardAfiliadosComponent } from './components/admin/control-de-comunidad/afiliados/dashboard-afiliados/dashboard-afiliados.component';
import { DashboardCategoriasComponent } from './components/admin/control-de-comunidad/categorias/dashboard-categorias/dashboard-categorias.component';
import { DashboardEstadisticasComponent } from './components/admin/control-de-comunidad/estadisticas/dashboard-estadisticas/dashboard-estadisticas.component';
import { DashboardReportesComponent } from './components/admin/control-de-comunidad/reportes/dashboard-reportes/dashboard-reportes.component';
import { DashboardVotosComponent } from './components/admin/control-de-comunidad/votos/dashboard-votos/dashboard-votos.component';
import { DashboardCommentsComponent } from './components/admin/control-de-contenido/comentarios/dashboard-comments/dashboard-comments.component';
import { DashboardContactosComponent } from './components/admin/control-de-contenido/contactos/dashboard-contactos/dashboard-contactos.component';
import { DashboardMonitorComponent } from './components/admin/control-de-contenido/monitor/dashboard-monitor/dashboard-monitor.component';
import { DashboardNoticiasComponent } from './components/admin/control-de-contenido/noticias/dashboard-noticias/dashboard-noticias.component';
import { DashboardPaisesComponent } from './components/admin/control-de-contenido/paises/dashboard-paises/dashboard-paises.component';
import { DashboardPostsComponent } from './components/admin/control-de-contenido/posts/dashboard-posts/dashboard-posts.component';
import { DashboardShoutsComponent } from './components/admin/control-de-contenido/shouts/dashboard-shouts/dashboard-shouts.component';
import { DashboardAdminComponent } from './components/admin/dashboard-admin/dashboard-admin.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { DashboardConfigurationComponent } from './components/admin/general/configuration/dashboard-configuration/dashboard-configuration.component';
import { DashboardAdsComponent } from './components/admin/general/publicidad/dashboard-ads/dashboard-ads.component';
import { DashboardRangosComponent } from './components/admin/usuarios/rangos/dashboard-rangos/dashboard-rangos.component';
import { DashboardSesionesComponent } from './components/admin/usuarios/sesiones/dashboard-sesiones/dashboard-sesiones.component';
import { DashboardUsuariosComponent } from './components/admin/usuarios/usuarios/dashboard-usuarios/dashboard-usuarios.component';
import { MiHomeComponent } from './components/mi/mi-home/mi-home.component';
import { AccountComponent } from './components/pages/account/account.component';
import { ApiDocumentationComponent } from './components/pages/api-documentation/api-documentation.component';
import { BorradoresComponent } from './components/pages/borradores/borradores.component';
import { EnVivoComponent } from './components/pages/en-vivo/en-vivo.component';
import { FavoritosComponent } from './components/pages/favoritos/favoritos.component';
import { LoginComponent } from './components/pages/login/login.component';
import { MensajesComponent } from './components/pages/mensajes/mensajes.component';
import { ModHistoryComponent } from './components/pages/mod-history/mod-history.component';
import { MonitorComponent } from './components/pages/monitor/monitor.component';
import { PageContactoComponent } from './components/pages/page-contacto/page-contacto.component';
import { PerfilComponent } from './components/pages/perfil/perfil.component';
import { RegisterComponent } from './components/pages/register/register.component';
import { SearchComponent } from './components/pages/search/search.component';
import { ShoutsViewComponent } from './components/pages/shouts/shouts-view/shouts-view.component';
import { TopsComponent } from './components/pages/tops/tops.component';
import { UsuariosComponent } from './components/pages/usuarios/usuarios.component';
import { PostNotFoundComponent } from './components/posts/post-not-found/post-not-found.component';
import { PostPrivadoComponent } from './components/posts/post-privado/post-privado.component';
import { PostsCreateComponent } from './components/posts/posts-create/posts-create.component';
import { PostsViewComponent } from './components/posts/posts-view/posts-view.component';
import { SectionHomeForumComponent } from './components/sections/section-home-forum/section-home-forum.component';
import { SectionHomeComponent } from './components/sections/section-home/section-home.component';
import { AdministradorAuthorization } from './shared/guards/adminAuthorization.guard';
import { AuthGuard } from './shared/guards/auth.guard';
import { AuthLoggedUserGuard } from './shared/guards/auth.loggedUser.guard';
import { DashboardPaginasComponent } from './components/admin/control-de-contenido/paginas/dashboard-paginas/dashboard-paginas.component';
import { PaginasComponent } from './components/pages/paginas/paginas.component';
import { MensajesConversacionComponent } from './components/pages/mensajes/mensajes-conversacion/mensajes-conversacion.component';
import { MensajesEnviadosComponent } from './components/pages/mensajes/mensajes-enviados/mensajes-enviados.component';
import { DashboardMensajesComponent } from './components/admin/control-de-contenido/mensajes/dashboard-mensajes/dashboard-mensajes.component';

const routes: Routes = [
  { path: '', component: SectionHomeForumComponent },
  {
    path: 'registro',
    component: RegisterComponent,
    canActivate: [AuthLoggedUserGuard],
  },

  { path: 'buscar', component: SearchComponent },
  { path: 'buscar/:tipo/:query', component: SearchComponent },
  { path: 'buscar/:tipo/:query/:categoria', component: SearchComponent },

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthLoggedUserGuard],
  },
  { path: 'cuenta', component: AccountComponent, canActivate: [AuthGuard] },
  { path: 'en-vivo', component: EnVivoComponent },
  { path: 'perfil/:userName', component: PerfilComponent },
  { path: 'shouts/:userName/:id', component: ShoutsViewComponent },

  { path: 'posts/:categoria', component: SectionHomeForumComponent },
  { path: 'posts/:categoria/:id/:nombre-post', component: PostsViewComponent },
  { path: 'posts/404/:nombre-post', component: PostNotFoundComponent },
  {
    path: 'posts/privado/:nombre-post',
    component: PostPrivadoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crear/post',
    component: PostsCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'posts/actualizar/:id',
    component: PostsCreateComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'mod-history',
    component: ModHistoryComponent,
    canActivate: [AuthGuard],
  },
  { path: 'mensajes', component: MensajesComponent, canActivate: [AuthGuard] },
  {
    path: 'mensajes/enviados',
    component: MensajesEnviadosComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'mensajes/carpeta/:nombre',
    component: MensajesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'mensajes/conversacion/:id',
    component: MensajesConversacionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'mod-history',
    component: ModHistoryComponent,
    canActivate: [AuthGuard],
  },
  { path: 'monitor', component: MonitorComponent, canActivate: [AuthGuard] },
  { path: 'tops', component: TopsComponent },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard] },
  {
    path: 'favoritos',
    component: FavoritosComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'borradores',
    component: BorradoresComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'mi',
    component: MiHomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'paginas/:slug',
    component: PaginasComponent,
  },

  { path: 'contacto', component: PageContactoComponent },
  {
    path: 'api',
    component: ApiDocumentationComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'administracion',
    component: DashboardComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardAdminComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'configuracion',
        component: DashboardConfigurationComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'posts',
        component: DashboardPostsComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'afiliados',
        component: DashboardAfiliadosComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'categorias',
        component: DashboardCategoriasComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'publicidad',
        component: DashboardAdsComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'comentarios',
        component: DashboardCommentsComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'paises',
        component: DashboardPaisesComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'sesiones',
        component: DashboardSesionesComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'denuncias',
        component: DashboardReportesComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'usuarios',
        component: DashboardUsuariosComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'rango-usuarios',
        component: DashboardRangosComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'shouts',
        component: DashboardShoutsComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'estadisticas',
        component: DashboardEstadisticasComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'noticias',
        component: DashboardNoticiasComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'monitor',
        component: DashboardMonitorComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'contacto',
        component: DashboardContactosComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'votos',
        component: DashboardVotosComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'paginas',
        component: DashboardPaginasComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
      {
        path: 'mensajes',
        component: DashboardMensajesComponent,
        canActivate: [AuthGuard, AdministradorAuthorization],
      },
    ],
    canActivate: [AuthGuard, AdministradorAuthorization],
  },

  { path: '*', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
