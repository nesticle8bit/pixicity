import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ComunidadesIndexComponent } from '../../components/comunidades/comunidades-index/comunidades-index.component';
import { ComunidadCreateComponent } from '../../components/comunidades/comunidad-create/comunidad-create.component';
import { ComunidadViewComponent } from '../../components/comunidades/comunidad-view/comunidad-view.component';
import { ComunidadEditComponent } from '../../components/comunidades/comunidad-edit/comunidad-edit.component';
import { ComunidadTemaCreateComponent } from '../../components/comunidades/comunidad-tema-create/comunidad-tema-create.component';
import { ComunidadTemaViewComponent } from '../../components/comunidades/comunidad-tema-view/comunidad-tema-view.component';
import { ComunidadMiembrosComponent } from '../../components/comunidades/comunidad-miembros/comunidad-miembros.component';
import { ComunidadesExplorarComponent } from '../../components/comunidades/comunidades-explorar/comunidades-explorar.component';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { ComunidadModeracionComponent } from '../../components/comunidades/comunidad-moderacion/comunidad-moderacion.component';
import { nombreDesdeSlug, tituloConParametro } from '../../services/shared/seo-title.strategy';

const routes: Routes = [
  { path: '', component: ComunidadesIndexComponent },
  { path: 'explorar', component: ComunidadesExplorarComponent, title: 'Explorar comunidades' },
  { path: 'crear', component: ComunidadCreateComponent, canActivate: [AuthGuard], title: 'Crear comunidad', data: { noIndex: true } },
  { path: ':slug/editar', component: ComunidadEditComponent, canActivate: [AuthGuard], title: 'Editar comunidad', data: { noIndex: true } },
  { path: ':slug/nuevo-tema', component: ComunidadTemaCreateComponent, canActivate: [AuthGuard], title: 'Nuevo tema', data: { noIndex: true } },
  { path: ':slug/tema/:id/editar', component: ComunidadTemaCreateComponent, canActivate: [AuthGuard], title: 'Editar tema', data: { noIndex: true } },
  { path: ':slug/miembros', component: ComunidadMiembrosComponent, title: tituloConParametro('slug', (c) => `Miembros de ${nombreDesdeSlug(c)}`), data: { noIndex: true } },
  { path: ':slug/moderacion', component: ComunidadModeracionComponent, canActivate: [AuthGuard], title: 'Moderación de la comunidad', data: { noIndex: true } },
  { path: ':slug/tema/:id/:url', component: ComunidadTemaViewComponent, title: tituloConParametro('url', nombreDesdeSlug) },
  { path: ':slug', component: ComunidadViewComponent, title: tituloConParametro('slug', (c) => `${nombreDesdeSlug(c)} · Comunidad`) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComunidadesRoutingModule {}
