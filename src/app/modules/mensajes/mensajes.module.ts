import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';

import { SharedModule } from '../shared/shared.module';
import { MensajesRoutingModule } from './mensajes-routing.module';

import { MensajesComponent } from '../../components/pages/mensajes/mensajes.component';
import { MensajesConversacionComponent } from '../../components/pages/mensajes/mensajes-conversacion/mensajes-conversacion.component';
import { MensajesSidebarComponent } from '../../components/pages/mensajes/mensajes-sidebar/mensajes-sidebar.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatPaginatorModule,
        SharedModule,
        MensajesRoutingModule,
        MensajesComponent, MensajesConversacionComponent, MensajesSidebarComponent,
    ],
})
export class MensajesModule {}
