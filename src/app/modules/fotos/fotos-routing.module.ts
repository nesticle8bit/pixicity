import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FotosIndexComponent } from '../../components/fotos/fotos-index/fotos-index.component';
import { FotoDetailComponent } from '../../components/fotos/foto-detail/foto-detail.component';
import { FotoCreateComponent } from '../../components/fotos/foto-create/foto-create.component';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { tituloConParametro } from '../../services/shared/seo-title.strategy';

// Cargado de forma diferida bajo /fotos (ver app-routing.module.ts). El orden importa: las rutas fijas
// ("crear", "actualizar/:id") van antes que ":userName".
const routes: Routes = [
  { path: '', component: FotosIndexComponent, data: { descripcion: 'Las últimas fotos que comparte la comunidad de Taringas!: imágenes, memes, capturas y más.' } },
  { path: 'crear', component: FotoCreateComponent, canActivate: [AuthGuard], title: 'Subir foto', data: { noIndex: true } },
  { path: 'actualizar/:id', component: FotoCreateComponent, canActivate: [AuthGuard], title: 'Editar foto', data: { noIndex: true } },
  { path: ':userName', component: FotosIndexComponent, title: tituloConParametro('userName', (u) => `Fotos de @${u}`) },
  { path: ':userName/:id/:slug', component: FotoDetailComponent, title: tituloConParametro('userName', (u) => `Foto de @${u}`) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FotosRoutingModule {}
