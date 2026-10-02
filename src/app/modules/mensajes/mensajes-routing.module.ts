import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MensajesComponent } from '../../components/pages/mensajes/mensajes.component';
import { MensajesConversacionComponent } from '../../components/pages/mensajes/mensajes-conversacion/mensajes-conversacion.component';
import { AuthGuard } from '../../shared/guards/auth.guard';

// Cargado de forma diferida bajo /mensajes (ver app-routing.module.ts).
const routes: Routes = [
  { path: '', component: MensajesComponent, canActivate: [AuthGuard] },
  // El chat ya muestra ambos sentidos: las antiguas vistas "enviados" y "carpeta" redirigen a la bandeja.
  { path: 'enviados', redirectTo: '', pathMatch: 'full' },
  { path: 'carpeta/:nombre', redirectTo: '', pathMatch: 'full' },
  { path: 'chat/:userName', component: MensajesConversacionComponent, canActivate: [AuthGuard] },
  { path: 'conversacion/:id', component: MensajesConversacionComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MensajesRoutingModule {}
