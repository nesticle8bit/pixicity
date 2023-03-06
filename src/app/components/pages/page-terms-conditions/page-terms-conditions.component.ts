import { Component, OnInit } from '@angular/core';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-page-terms-conditions',
  templateUrl: './page-terms-conditions.component.html',
  styleUrls: ['./page-terms-conditions.component.scss'],
})
export class PageTermsConditionsComponent implements OnInit {
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
