import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardAfiliadosComponent } from './components/admin/control-de-comunidad/afiliados/dashboard-afiliados/dashboard-afiliados.component';
import { DashboardReportesComponent } from './components/admin/control-de-comunidad/reportes/dashboard-reportes/dashboard-reportes.component';
import { DashboardCommentsComponent } from './components/admin/control-de-contenido/comentarios/dashboard-comments/dashboard-comments.component';
import { DashboardPaisesComponent } from './components/admin/control-de-contenido/paises/dashboard-paises/dashboard-paises.component';
import { DashboardPostsComponent } from './components/admin/control-de-contenido/posts/dashboard-posts/dashboard-posts.component';
import { DashboardAdminComponent } from './components/admin/dashboard-admin/dashboard-admin.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { DashboardConfigurationComponent } from './components/admin/general/configuration/dashboard-configuration/dashboard-configuration.component';
import { DashboardAdsComponent } from './components/admin/general/publicidad/dashboard-ads/dashboard-ads.component';
import { DashboardSesionesComponent } from './components/admin/usuarios/sesiones/dashboard-sesiones/dashboard-sesiones.component';
import { AccountComponent } from './pages/account/account.component';
import { BorradoresComponent } from './pages/borradores/borradores.component';
import { EnVivoComponent } from './pages/en-vivo/en-vivo.component';
import { FavoritosComponent } from './pages/favoritos/favoritos.component';
import { LoginComponent } from './pages/login/login.component';
import { MensajesComponent } from './pages/mensajes/mensajes.component';
import { ModHistoryComponent } from './pages/mod-history/mod-history.component';
import { MonitorComponent } from './pages/monitor/monitor.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { RegisterComponent } from './pages/register/register.component';
import { SearchComponent } from './pages/search/search.component';
import { TopsComponent } from './pages/tops/tops.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { PostNotFoundComponent } from './posts/post-not-found/post-not-found.component';
import { PostsCreateComponent } from './posts/posts-create/posts-create.component';
import { PostsViewComponent } from './posts/posts-view/posts-view.component';
import { SectionHomeComponent } from './sections/section-home/section-home.component';

const routes: Routes = [
  { path: '', component: SectionHomeComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'buscar', component: SearchComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cuenta', component: AccountComponent },
  { path: 'en-vivo', component: EnVivoComponent },
  { path: 'perfil/:userName', component: PerfilComponent },

  { path: 'posts/:categoria', component: SectionHomeComponent },
  { path: 'posts/:categoria/:id/:nombre-post', component: PostsViewComponent },
  { path: 'posts/404/:nombre-post', component: PostNotFoundComponent },
  { path: 'crear/post', component: PostsCreateComponent },
  { path: 'posts/actualizar/:id', component: PostsCreateComponent },

  { path: 'mod-history', component: ModHistoryComponent },
  { path: 'mensajes', component: MensajesComponent },
  { path: 'mod-history', component: ModHistoryComponent },
  { path: 'monitor', component: MonitorComponent },
  { path: 'tops', component: TopsComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'favoritos', component: FavoritosComponent },
  { path: 'borradores', component: BorradoresComponent },
  {
    path: 'administracion', component: DashboardComponent, children:
    [
      { path: 'dashboard', component: DashboardAdminComponent },
      { path: 'configuracion', component: DashboardConfigurationComponent },
      { path: 'posts', component: DashboardPostsComponent },
      { path: 'afiliados', component: DashboardAfiliadosComponent },
      { path: 'publicidad', component: DashboardAdsComponent },
      { path: 'comentarios', component: DashboardCommentsComponent },
      { path: 'paises', component: DashboardPaisesComponent },
      { path: 'sesiones', component: DashboardSesionesComponent },
      { path: 'reportes', component: DashboardReportesComponent },
    ]
  },
  
  { path: '*', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
