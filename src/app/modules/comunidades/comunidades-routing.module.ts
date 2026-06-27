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

const routes: Routes = [
  { path: '', component: ComunidadesIndexComponent },
  { path: 'explorar', component: ComunidadesExplorarComponent },
  { path: 'crear', component: ComunidadCreateComponent, canActivate: [AuthGuard] },
  { path: ':slug/editar', component: ComunidadEditComponent, canActivate: [AuthGuard] },
  { path: ':slug/nuevo-tema', component: ComunidadTemaCreateComponent, canActivate: [AuthGuard] },
  { path: ':slug/tema/:id/editar', component: ComunidadTemaCreateComponent, canActivate: [AuthGuard] },
  { path: ':slug/miembros', component: ComunidadMiembrosComponent },
  { path: ':slug/tema/:id/:url', component: ComunidadTemaViewComponent },
  { path: ':slug', component: ComunidadViewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComunidadesRoutingModule {}
