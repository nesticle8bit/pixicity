import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FotosIndexComponent } from '../../components/fotos/fotos-index/fotos-index.component';
import { FotoDetailComponent } from '../../components/fotos/foto-detail/foto-detail.component';
import { FotoCreateComponent } from '../../components/fotos/foto-create/foto-create.component';
import { AuthGuard } from '../../shared/guards/auth.guard';

// Cargado de forma diferida bajo /fotos (ver app-routing.module.ts). El orden importa: las rutas fijas
// ("crear", "actualizar/:id") van antes que ":userName".
const routes: Routes = [
  { path: '', component: FotosIndexComponent },
  { path: 'crear', component: FotoCreateComponent, canActivate: [AuthGuard] },
  { path: 'actualizar/:id', component: FotoCreateComponent, canActivate: [AuthGuard] },
  { path: ':userName', component: FotosIndexComponent },
  { path: ':userName/:id/:slug', component: FotoDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FotosRoutingModule {}
