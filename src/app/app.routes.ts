import { Routes } from '@angular/router';
import { PostNotFoundComponent } from './components/posts/post-not-found/post-not-found.component';
import { PostsViewComponent } from './components/posts/posts-view/posts-view.component';
import { SectionHomeForumComponent } from './components/sections/section-home-forum/section-home-forum.component';
import { AdministradorAuthorization } from './shared/guards/adminAuthorization.guard';
import { ModeradorAuthorization } from './shared/guards/moderadorAuthorization.guard';
import { AuthGuard } from './shared/guards/auth.guard';
import { AuthLoggedUserGuard } from './shared/guards/auth.loggedUser.guard';
import { nombreDesdeSlug, tituloConParametro } from './services/shared/seo-title.strategy';

// Solo el home, el post y el 404 van en el bundle inicial (son las páginas de entrada); el resto se carga al navegar.
// `title` y `data` (descripcion/noIndex) son el SEO por defecto de cada ruta (SeoTitleStrategy); las vistas
// con datos reales (post, perfil, shout, foto...) lo reemplazan con SEOService.setSEO al cargar.
export const routes: Routes = [
  { path: '', component: SectionHomeForumComponent, title: 'Taringas! - Inteligencia colectiva | Posts y comunidades' },
  // Igual que el home, pero el listado muestra solo los posts de usuarios con rango Novato (el home, el resto).
  { path: 'novatos', component: SectionHomeForumComponent, title: 'Novatos | Posts de los nuevos usuarios', data: { novatos: true } },
  {
    path: 'registro',
    title: 'Crear cuenta',
    data: { descripcion: 'Creá tu cuenta gratis en Taringas!: publicá posts, sumate a comunidades, compartí fotos y shouts y ganá puntos.' },
    loadComponent: () =>
      import('./components/pages/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
    canActivate: [AuthLoggedUserGuard],
  },

  {
    path: 'buscar',
    title: 'Buscar',
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/pages/search/search.component').then(
        (m) => m.SearchComponent,
      ),
  },
  {
    path: 'buscar/:tipo/:query',
    title: tituloConParametro('query', (q) => `${q} · Buscar`),
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/pages/search/search.component').then(
        (m) => m.SearchComponent,
      ),
  },
  {
    path: 'buscar/:tipo/:query/:categoria',
    title: tituloConParametro('query', (q) => `${q} · Buscar`),
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/pages/search/search.component').then(
        (m) => m.SearchComponent,
      ),
  },

  {
    path: 'login',
    title: 'Iniciar sesión',
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    canActivate: [AuthLoggedUserGuard],
  },
  {
    path: 'confirmar-email',
    title: 'Confirmar correo',
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/pages/confirmar-email/confirmar-email.component').then(
        (m) => m.ConfirmarEmailComponent,
      ),
  },
  {
    path: 'olvide-password',
    title: 'Recuperar contraseña',
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/pages/restablecer-password/olvide-password.component').then(
        (m) => m.OlvidePasswordComponent,
      ),
  },
  {
    path: 'restablecer-password',
    title: 'Nueva contraseña',
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/pages/restablecer-password/restablecer-password.component').then(
        (m) => m.RestablecerPasswordComponent,
      ),
  },
  {
    path: 'cuenta',
    title: 'Mi cuenta',
    data: { noIndex: true },
    loadChildren: () =>
      import('./modules/cuenta/cuenta.module').then((m) => m.CuentaModule),
  },
  {
    path: 'en-vivo',
    title: 'En vivo',
    loadComponent: () =>
      import('./components/pages/en-vivo/en-vivo.component').then(
        (m) => m.EnVivoComponent,
      ),
  },
  {
    path: 'perfil/:userName',
    title: tituloConParametro('userName', (u) => `@${u} · Perfil`),
    loadComponent: () =>
      import('./components/pages/perfil/perfil.component').then(
        (m) => m.PerfilComponent,
      ),
  },
  {
    path: 'shouts/:userName/:id',
    title: tituloConParametro('userName', (u) => `Shout de @${u}`),
    loadComponent: () =>
      import('./components/pages/shouts/shouts-view/shouts-view.component').then(
        (m) => m.ShoutsViewComponent,
      ),
  },

  { path: 'posts/:categoria', component: SectionHomeForumComponent, title: tituloConParametro('categoria', (c) => `${nombreDesdeSlug(c)} | Posts de la comunidad`) },
  { path: 'posts/:categoria/:id/:nombre-post', component: PostsViewComponent, title: tituloConParametro('nombre-post', nombreDesdeSlug) },
  { path: 'posts/404/:nombre-post', component: PostNotFoundComponent, title: 'Post no encontrado', data: { noIndex: true } },
  {
    path: 'posts/privado/:nombre-post',
    title: 'Post privado',
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/posts/post-privado/post-privado.component').then(
        (m) => m.PostPrivadoComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'crear/post',
    title: 'Crear post',
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/posts/posts-create/posts-create.component').then(
        (m) => m.PostsCreateComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'posts/actualizar/:id',
    title: 'Editar post',
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/posts/posts-create/posts-create.component').then(
        (m) => m.PostsCreateComponent,
      ),
    canActivate: [AuthGuard],
  },

  {
    path: 'mod-history',
    title: 'Historial de moderación',
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/pages/mod-history/mod-history.component').then(
        (m) => m.ModHistoryComponent,
      ),
    canActivate: [AuthGuard, ModeradorAuthorization],
  },
  {
    path: 'mensajes',
    title: 'Mensajes',
    data: { noIndex: true },
    loadChildren: () =>
      import('./modules/mensajes/mensajes.module').then(
        (m) => m.MensajesModule,
      ),
  },
  {
    path: 'monitor',
    title: 'Notificaciones',
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/pages/monitor/monitor.component').then(
        (m) => m.MonitorComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'tops',
    title: 'Tops',
    loadComponent: () =>
      import('./components/pages/tops/tops.component').then(
        (m) => m.TopsComponent,
      ),
  },
  {
    path: 'usuarios',
    title: 'Usuarios',
    loadComponent: () =>
      import('./components/pages/usuarios/usuarios.component').then(
        (m) => m.UsuariosComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'favoritos',
    title: 'Mis favoritos',
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/pages/favoritos/favoritos.component').then(
        (m) => m.FavoritosComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'borradores',
    title: 'Mis borradores',
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/pages/borradores/borradores.component').then(
        (m) => m.BorradoresComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'mi',
    title: 'Shouts',
    loadComponent: () =>
      import('./components/mi/mi-home/mi-home.component').then(
        (m) => m.MiHomeComponent,
      ),
  },
  // Primer ingreso después de registrarse (el registro manda a /login?returnUrl=/bienvenida).
  {
    path: 'bienvenida',
    title: 'Bienvenida',
    data: { noIndex: true },
    loadComponent: () =>
      import('./components/pages/bienvenida/bienvenida.component').then(
        (m) => m.BienvenidaComponent,
      ),
    canActivate: [AuthGuard],
  },
  // Página pública e indexable de cada #hashtag de los shouts (mismo muro, filtrado).
  {
    path: 'hashtag/:tag',
    title: tituloConParametro('tag', (t) => `#${t} · Shouts`),
    loadComponent: () =>
      import('./components/mi/mi-home/mi-home.component').then(
        (m) => m.MiHomeComponent,
      ),
  },
  {
    path: 'fotos',
    title: 'Fotos',
    loadChildren: () =>
      import('./modules/fotos/fotos.module').then((m) => m.FotosModule),
  },
  // Ruta anterior de crear foto: se conserva para no romper enlaces guardados.
  { path: 'crear/foto', redirectTo: 'fotos/crear', pathMatch: 'full' },

  {
    path: 'paginas/:slug',
    title: tituloConParametro('slug', nombreDesdeSlug),
    loadComponent: () =>
      import('./components/pages/paginas/paginas.component').then(
        (m) => m.PaginasComponent,
      ),
  },

  {
    path: 'contacto',
    title: 'Contacto',
    data: { descripcion: 'Escribile al equipo de Taringas!: consultas, sugerencias, reportes de contenido o publicidad.' },
    loadComponent: () =>
      import('./components/pages/page-contacto/page-contacto.component').then(
        (m) => m.PageContactoComponent,
      ),
  },
  // {
  //   path: 'api',
  //   title: 'Documentación de la API',
  //   data: { noIndex: true },
  //   loadComponent: () =>
  //     import('./components/pages/api-documentation/api-documentation.component').then(
  //       (m) => m.ApiDocumentationComponent,
  //     ),
  //   canActivate: [AuthGuard],
  // },

  {
    path: 'apelaciones',
    title: 'Mis apelaciones',
    data: { noIndex: true },
    loadComponent: () => import('./components/pages/apelaciones/apelaciones.component').then((m) => m.ApelacionesComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'moderacion',
    title: 'Moderación',
    data: { noIndex: true },
    canActivate: [AuthGuard, ModeradorAuthorization],
    loadChildren: () =>
      import('./modules/moderacion/moderacion.routes').then(
        (m) => m.MODERACION_ROUTES,
      ),
  },

  {
    path: 'administracion',
    title: 'Administración',
    data: { noIndex: true },
    canActivate: [AuthGuard, AdministradorAuthorization],
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
  },

  {
    path: 'comunidades',
    title: 'Comunidades',
    loadChildren: () =>
      import('./modules/comunidades/comunidades.module').then(
        (m) => m.ComunidadesModule,
      ),
  },

  // '*' no es un comodin valido en Angular (es '**'): con el anterior las URLs
  // desconocidas no matcheaban ninguna ruta y el bot recibia una pagina rota.
  { path: '**', component: PostNotFoundComponent, title: 'Página no encontrada', data: { noIndex: true } },
];
