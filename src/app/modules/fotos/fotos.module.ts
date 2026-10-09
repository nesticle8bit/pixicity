import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { FotosRoutingModule } from './fotos-routing.module';

import { FotosIndexComponent } from '../../components/fotos/fotos-index/fotos-index.component';
import { FotoDetailComponent } from '../../components/fotos/foto-detail/foto-detail.component';
import { FotoCreateComponent } from '../../components/fotos/foto-create/foto-create.component';
import { FotoComentariosComponent } from '../../components/fotos/foto-comentarios/foto-comentarios.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        FotosRoutingModule,
        FotosIndexComponent, FotoDetailComponent, FotoCreateComponent, FotoComentariosComponent,
    ],
})
export class FotosModule {}
