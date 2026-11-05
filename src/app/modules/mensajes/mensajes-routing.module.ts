import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MensajesComponent } from '../../components/pages/mensajes/mensajes.component';
import { MensajesConversacionComponent } from '../../components/pages/mensajes/mensajes-conversacion/mensajes-conversacion.component';
import { MensajesVacioComponent } from '../../components/pages/mensajes/mensajes-vacio.component';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { tituloConParametro } from '../../services/shared/seo-title.strategy';

// Cargado de forma diferida bajo /mensajes (ver app-routing.module.ts).
// Estilo WhatsApp: MensajesComponent es el marco (lista de conversaciones a la izquierda) y el chat abierto es la
// ruta hija que se pinta a la derecha; sin chat elegido queda un panel vacío.
const routes: Routes = [
  // El chat ya muestra ambos sentidos: las antiguas vistas "enviados" y "carpeta" redirigen a la bandeja.
  { path: 'enviados', redirectTo: '', pathMatch: 'full' },
  { path: 'carpeta/:nombre', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    component: MensajesComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: MensajesVacioComponent },
      { path: 'chat/:userName', component: MensajesConversacionComponent, title: tituloConParametro('userName', (u) => `Chat con @${u} · Mensajes`) },
      { path: 'conversacion/:id', component: MensajesConversacionComponent, title: 'Conversación · Mensajes' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MensajesRoutingModule {}
