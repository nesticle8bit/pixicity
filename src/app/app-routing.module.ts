import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { MensajesComponent } from './pages/mensajes/mensajes.component';
import { ModHistoryComponent } from './pages/mod-history/mod-history.component';
import { MonitorComponent } from './pages/monitor/monitor.component';
import { RegisterComponent } from './pages/register/register.component';
import { SearchComponent } from './pages/search/search.component';
import { TopsComponent } from './pages/tops/tops.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { PostsCreateComponent } from './posts/posts-create/posts-create.component';
import { PostsViewComponent } from './posts/posts-view/posts-view.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'buscar', component: SearchComponent },
  { path: 'login', component: LoginComponent },

  { path: 'posts/:categoria/:id/:nombre-post', component: PostsViewComponent },
  { path: 'crear-post', component: PostsCreateComponent },
  
  { path: 'mod-history', component: ModHistoryComponent },
  { path: 'mensajes', component: MensajesComponent },
  { path: 'mod-history', component: ModHistoryComponent },
  { path: 'monitor', component: MonitorComponent },
  { path: 'tops', component: TopsComponent },
  { path: 'usuarios', component: UsuariosComponent },

  { path: '*', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
