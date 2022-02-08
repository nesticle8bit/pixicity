import { Component, OnInit } from '@angular/core';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-tops',
  templateUrl: './tops.component.html',
  styleUrls: ['./tops.component.scss'],
})
export class TopsComponent implements OnInit {
  public categorias: any[] = [];

  constructor(
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
    
  }
}
