import { Component, OnInit } from '@angular/core';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-page-contacto',
  templateUrl: './page-contacto.component.html',
  styleUrls: ['./page-contacto.component.scss'],
})
export class PageContactoComponent implements OnInit {
  constructor(private displayService: DisplayComponentService) {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: false,
      submenu: true,
    });
  }

  ngOnInit(): void {}
}
