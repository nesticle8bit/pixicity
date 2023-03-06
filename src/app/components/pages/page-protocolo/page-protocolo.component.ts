import { Component, OnInit } from '@angular/core';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-page-protocolo',
  templateUrl: './page-protocolo.component.html',
  styleUrls: ['./page-protocolo.component.scss'],
})
export class PageProtocoloComponent implements OnInit {
  constructor(private displayService: DisplayComponentService) {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: ''
    });
  }

  ngOnInit(): void {}
}
