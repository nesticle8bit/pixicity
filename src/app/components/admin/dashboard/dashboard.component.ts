import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    imports: [DashboardSidebarComponent, RouterOutlet],
})
export class DashboardComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private title = inject(Title);

  constructor() {
    this.title.setTitle('Panel de Administración | Taringa - Inteligencia colectiva | Comunidad para Compartir Información');
  }

  ngOnInit(): void {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: false,
      submenu: true,
      background: '',
    });
  }
}
