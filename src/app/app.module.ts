import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { MainHeaderComponent } from './main/main-header/main-header.component';
import { MainMenuComponent } from './main/main-menu/main-menu.component';
import { MainSubmenuComponent } from './main/main-submenu/main-submenu.component';
import { SectionHomeComponent } from './sections/section-home/section-home.component';
import { HomeLastPostsComponent } from './home/home-last-posts/home-last-posts.component';
import { HomeStatsComponent } from './home/home-stats/home-stats.component';
import { HomeLastCommentsComponent } from './home/home-last-comments/home-last-comments.component';
import { HomeLastPhotosComponent } from './home/home-last-photos/home-last-photos.component';
import { HomeAfiliadosComponent } from './home/home-afiliados/home-afiliados.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { HomeTopPostsComponent } from './home/home-top-posts/home-top-posts.component';
import { HomeTopUsersComponent } from './home/home-top-users/home-top-users.component';

@NgModule({
  declarations: [
    AppComponent,
    MainHeaderComponent,
    MainMenuComponent,
    MainSubmenuComponent,
    SectionHomeComponent,
    HomeLastPostsComponent,
    HomeStatsComponent,
    HomeLastCommentsComponent,
    HomeLastPhotosComponent,
    HomeAfiliadosComponent,
    HomeTopPostsComponent,
    HomeTopUsersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far, fab);
  }
}
