import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MiHomeComponent } from './components/mi/mi-home/mi-home.component';
import { ApiDocumentationComponent } from './components/pages/api-documentation/api-documentation.component';
import { BorradoresComponent } from './components/pages/borradores/borradores.component';
import { EnVivoComponent } from './components/pages/en-vivo/en-vivo.component';
import { FavoritosComponent } from './components/pages/favoritos/favoritos.component';
import { LoginComponent } from './components/pages/login/login.component';
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
import { AdministradorAuthorization } from './shared/guards/adminAuthorization.guard';
import { AuthGuard } from './shared/guards/auth.guard';
import { AuthLoggedUserGuard } from './shared/guards/auth.loggedUser.guard';
import { PaginasComponent } from './components/pages/paginas/paginas.component';

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
  {
    path: 'cuenta',
    loadChildren: () => import('./modules/cuenta/cuenta.module').then((m) => m.CuentaModule),
  },
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
  {
    path: 'mensajes',
    loadChildren: () => import('./modules/mensajes/mensajes.module').then((m) => m.MensajesModule),
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
    path: 'fotos',
    loadChildren: () => import('./modules/fotos/fotos.module').then((m) => m.FotosModule),
  },
  // Ruta anterior de crear foto: se conserva para no romper enlaces guardados.
  { path: 'crear/foto', redirectTo: 'fotos/crear', pathMatch: 'full' },

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
    canActivate: [AuthGuard, AdministradorAuthorization],
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
  },

  {
    path: 'comunidades',
    loadChildren: () =>
      import('./modules/comunidades/comunidades.module').then((m) => m.ComunidadesModule),
  },

  // '*' no es un comodin valido en Angular (es '**'): con el anterior las URLs
  // desconocidas no matcheaban ninguna ruta y el bot recibia una pagina rota.
  { path: '**', component: PostNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
