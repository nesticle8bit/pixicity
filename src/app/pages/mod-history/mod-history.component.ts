import { Component, OnInit } from '@angular/core';
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
    private webService: IHttpWebService,
    private displayService: DisplayComponentService
  ) {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
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
