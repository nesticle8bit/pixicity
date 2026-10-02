import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountComponent } from '../../components/pages/account/account.component';
import { AuthGuard } from '../../shared/guards/auth.guard';

// Cargado de forma diferida bajo /cuenta (ver app-routing.module.ts).
const routes: Routes = [{ path: '', component: AccountComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CuentaRoutingModule {}
