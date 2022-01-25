import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'main-submenu',
  templateUrl: './main-submenu.component.html',
  styleUrls: ['./main-submenu.component.scss'],
})
export class MainSubmenuComponent implements OnInit {
  public display!: DisplayComponentModel;

  constructor(private displayService: DisplayComponentService) {}

  ngOnInit(): void {
    this.displayService
      .getDisplay()
      .subscribe((value: DisplayComponentModel) => {
        this.display = value;
      });
  }
}
