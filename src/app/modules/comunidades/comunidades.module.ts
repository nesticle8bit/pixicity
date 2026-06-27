import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { ComunidadesRoutingModule } from './comunidades-routing.module';

import { ComunidadesIndexComponent } from '../../components/comunidades/comunidades-index/comunidades-index.component';
import { ComunidadCreateComponent } from '../../components/comunidades/comunidad-create/comunidad-create.component';
import { ComunidadViewComponent } from '../../components/comunidades/comunidad-view/comunidad-view.component';
import { ComunidadEditComponent } from '../../components/comunidades/comunidad-edit/comunidad-edit.component';
import { ComunidadTemaCreateComponent } from '../../components/comunidades/comunidad-tema-create/comunidad-tema-create.component';
import { ComunidadTemaViewComponent } from '../../components/comunidades/comunidad-tema-view/comunidad-tema-view.component';
import { ComunidadMiembrosComponent } from '../../components/comunidades/comunidad-miembros/comunidad-miembros.component';
import { ComunidadesExplorarComponent } from '../../components/comunidades/comunidades-explorar/comunidades-explorar.component';
import { ComunidadesTemasRecientesComponent } from '../../components/comunidades/widgets/comunidades-temas-recientes/comunidades-temas-recientes.component';
import { ComunidadesUltimosComentariosComponent } from '../../components/comunidades/widgets/comunidades-ultimos-comentarios/comunidades-ultimos-comentarios.component';
import { ComunidadesTopComponent } from '../../components/comunidades/widgets/comunidades-top/comunidades-top.component';
import { ComunidadesTopTemasComponent } from '../../components/comunidades/widgets/comunidades-top-temas/comunidades-top-temas.component';
import { ComunidadesStatsComponent } from '../../components/comunidades/widgets/comunidades-stats/comunidades-stats.component';

@NgModule({
  declarations: [
    ComunidadesIndexComponent,
    ComunidadCreateComponent,
    ComunidadViewComponent,
    ComunidadEditComponent,
    ComunidadTemaCreateComponent,
    ComunidadTemaViewComponent,
    ComunidadMiembrosComponent,
    ComunidadesExplorarComponent,
    ComunidadesTemasRecientesComponent,
    ComunidadesUltimosComentariosComponent,
    ComunidadesTopComponent,
    ComunidadesTopTemasComponent,
    ComunidadesStatsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ComunidadesRoutingModule,
  ],
})
export class ComunidadesModule {}
