import { Routes } from '@angular/router';
import { ModeracionPanelComponent } from '../../components/moderacion/moderacion-panel/moderacion-panel.component';

// Las tablas son las del panel admin: el API decide qué puede hacer cada rango.
export const MODERACION_ROUTES: Routes = [
  {
    path: '',
    component: ModeracionPanelComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'reportes' },
      {
        path: 'reportes',
        loadComponent: () =>
          import('../../components/admin/control-de-contenido/moderacion/dashboard-moderacion/dashboard-moderacion.component').then(
            (m) => m.DashboardModeracionComponent,
          ),
      },
      {
        path: 'posts',
        loadComponent: () =>
          import('../../components/admin/control-de-contenido/posts/dashboard-posts/dashboard-posts.component').then((m) => m.DashboardPostsComponent),
      },
      {
        path: 'shouts',
        loadComponent: () =>
          import('../../components/admin/control-de-contenido/shouts/dashboard-shouts/dashboard-shouts.component').then((m) => m.DashboardShoutsComponent),
      },
      {
        path: 'comentarios',
        loadComponent: () =>
          import('../../components/admin/control-de-contenido/comentarios/dashboard-comments/dashboard-comments.component').then(
            (m) => m.DashboardCommentsComponent,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('../../components/moderacion/moderacion-usuarios/moderacion-usuarios.component').then((m) => m.ModeracionUsuariosComponent),
      },
    ],
  },
];
