import { Routes } from '@angular/router';
import { PostNotFoundComponent } from './components/posts/post-not-found/post-not-found.component';
import { PostsViewComponent } from './components/posts/posts-view/posts-view.component';
import { SectionHomeForumComponent } from './components/sections/section-home-forum/section-home-forum.component';
import { AdministradorAuthorization } from './shared/guards/adminAuthorization.guard';
import { ModeradorAuthorization } from './shared/guards/moderadorAuthorization.guard';
import { AuthGuard } from './shared/guards/auth.guard';
import { AuthLoggedUserGuard } from './shared/guards/auth.loggedUser.guard';

// Solo el home, el post y el 404 van en el bundle inicial (son las páginas de entrada); el resto se carga al navegar.
export const routes: Routes = [
  { path: '', component: SectionHomeForumComponent },
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/pages/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
    canActivate: [AuthLoggedUserGuard],
  },

  {
    path: 'buscar',
    loadComponent: () =>
      import('./components/pages/search/search.component').then(
        (m) => m.SearchComponent,
      ),
  },
  {
    path: 'buscar/:tipo/:query',
    loadComponent: () =>
      import('./components/pages/search/search.component').then(
        (m) => m.SearchComponent,
      ),
  },
  {
    path: 'buscar/:tipo/:query/:categoria',
    loadComponent: () =>
      import('./components/pages/search/search.component').then(
        (m) => m.SearchComponent,
      ),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./components/pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    canActivate: [AuthLoggedUserGuard],
  },
  {
    path: 'confirmar-email',
    loadComponent: () =>
      import('./components/pages/confirmar-email/confirmar-email.component').then(
        (m) => m.ConfirmarEmailComponent,
      ),
  },
  {
    path: 'olvide-password',
    loadComponent: () =>
      import('./components/pages/restablecer-password/olvide-password.component').then(
        (m) => m.OlvidePasswordComponent,
      ),
  },
  {
    path: 'restablecer-password',
    loadComponent: () =>
      import('./components/pages/restablecer-password/restablecer-password.component').then(
        (m) => m.RestablecerPasswordComponent,
      ),
  },
  {
    path: 'cuenta',
    loadChildren: () =>
      import('./modules/cuenta/cuenta.module').then((m) => m.CuentaModule),
  },
  {
    path: 'en-vivo',
    loadComponent: () =>
      import('./components/pages/en-vivo/en-vivo.component').then(
        (m) => m.EnVivoComponent,
      ),
  },
  {
    path: 'perfil/:userName',
    loadComponent: () =>
      import('./components/pages/perfil/perfil.component').then(
        (m) => m.PerfilComponent,
      ),
  },
  {
    path: 'shouts/:userName/:id',
    loadComponent: () =>
      import('./components/pages/shouts/shouts-view/shouts-view.component').then(
        (m) => m.ShoutsViewComponent,
      ),
  },

  { path: 'posts/:categoria', component: SectionHomeForumComponent },
  { path: 'posts/:categoria/:id/:nombre-post', component: PostsViewComponent },
  { path: 'posts/404/:nombre-post', component: PostNotFoundComponent },
  {
    path: 'posts/privado/:nombre-post',
    loadComponent: () =>
      import('./components/posts/post-privado/post-privado.component').then(
        (m) => m.PostPrivadoComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'crear/post',
    loadComponent: () =>
      import('./components/posts/posts-create/posts-create.component').then(
        (m) => m.PostsCreateComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'posts/actualizar/:id',
    loadComponent: () =>
      import('./components/posts/posts-create/posts-create.component').then(
        (m) => m.PostsCreateComponent,
      ),
    canActivate: [AuthGuard],
  },

  {
    path: 'mod-history',
    loadComponent: () =>
      import('./components/pages/mod-history/mod-history.component').then(
        (m) => m.ModHistoryComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'mensajes',
    loadChildren: () =>
      import('./modules/mensajes/mensajes.module').then(
        (m) => m.MensajesModule,
      ),
  },
  {
    path: 'monitor',
    loadComponent: () =>
      import('./components/pages/monitor/monitor.component').then(
        (m) => m.MonitorComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'tops',
    loadComponent: () =>
      import('./components/pages/tops/tops.component').then(
        (m) => m.TopsComponent,
      ),
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./components/pages/usuarios/usuarios.component').then(
        (m) => m.UsuariosComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'favoritos',
    loadComponent: () =>
      import('./components/pages/favoritos/favoritos.component').then(
        (m) => m.FavoritosComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'borradores',
    loadComponent: () =>
      import('./components/pages/borradores/borradores.component').then(
        (m) => m.BorradoresComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'mi',
    loadComponent: () =>
      import('./components/mi/mi-home/mi-home.component').then(
        (m) => m.MiHomeComponent,
      ),
  },
  // Primer ingreso después de registrarse (el registro manda a /login?returnUrl=/bienvenida).
  {
    path: 'bienvenida',
    loadComponent: () =>
      import('./components/pages/bienvenida/bienvenida.component').then(
        (m) => m.BienvenidaComponent,
      ),
    canActivate: [AuthGuard],
  },
  // Página pública e indexable de cada #hashtag de los shouts (mismo muro, filtrado).
  {
    path: 'hashtag/:tag',
    loadComponent: () =>
      import('./components/mi/mi-home/mi-home.component').then(
        (m) => m.MiHomeComponent,
      ),
  },
  {
    path: 'fotos',
    loadChildren: () =>
      import('./modules/fotos/fotos.module').then((m) => m.FotosModule),
  },
  // Ruta anterior de crear foto: se conserva para no romper enlaces guardados.
  { path: 'crear/foto', redirectTo: 'fotos/crear', pathMatch: 'full' },

  {
    path: 'paginas/:slug',
    loadComponent: () =>
      import('./components/pages/paginas/paginas.component').then(
        (m) => m.PaginasComponent,
      ),
  },

  {
    path: 'contacto',
    loadComponent: () =>
      import('./components/pages/page-contacto/page-contacto.component').then(
        (m) => m.PageContactoComponent,
      ),
  },
  {
    path: 'api',
    loadComponent: () =>
      import('./components/pages/api-documentation/api-documentation.component').then(
        (m) => m.ApiDocumentationComponent,
      ),
    canActivate: [AuthGuard],
  },

  {
    path: 'apelaciones',
    loadComponent: () => import('./components/pages/apelaciones/apelaciones.component').then((m) => m.ApelacionesComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'moderacion',
    canActivate: [AuthGuard, ModeradorAuthorization],
    loadChildren: () =>
      import('./modules/moderacion/moderacion.routes').then(
        (m) => m.MODERACION_ROUTES,
      ),
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
      import('./modules/comunidades/comunidades.module').then(
        (m) => m.ComunidadesModule,
      ),
  },

  // '*' no es un comodin valido en Angular (es '**'): con el anterior las URLs
  // desconocidas no matcheaban ninguna ruta y el bot recibia una pagina rota.
  { path: '**', component: PostNotFoundComponent },
];
