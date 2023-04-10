import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-mod-history',
  templateUrl: './mod-history.component.html',
  styleUrls: ['./mod-history.component.scss'],
})
export class ModHistoryComponent implements OnInit {
  public posts: any[] = [];

  constructor(
    private displayService: DisplayComponentService,
    private webService: IHttpWebService,
    private title: Title
  ) {
    this.title.setTitle(`Historial de moderación | Pixicity - Ciudad Pixelada | Comunidad para Compartir Información`);
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: ''
    });
  }

  ngOnInit(): void {
    this.getHistorialModeracion();
  }

  getHistorialModeracion(): void {
    this.webService.getHistorialModeracion().subscribe((response: any) => {
      this.posts = response;
    });
  }
}
