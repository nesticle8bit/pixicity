import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(
    private displayService: DisplayComponentService,
    private title: Title
  ) {
    this.title.setTitle('Panel de Administración | Pixicity - Ciudad Pixelada | Comunidad para Compartir Información');
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
