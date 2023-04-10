import { Component, OnInit } from '@angular/core';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-api-documentation',
  templateUrl: './api-documentation.component.html',
  styleUrls: ['./api-documentation.component.scss'],
})
export class ApiDocumentationComponent implements OnInit {
  constructor(private displayService: DisplayComponentService) {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: false,
      submenu: true,
      background: '',
    });
  }

  ngOnInit(): void {}
}
