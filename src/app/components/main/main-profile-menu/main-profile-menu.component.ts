import { Component, OnInit, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-main-profile-menu',
    templateUrl: './main-profile-menu.component.html',
    styleUrls: ['./main-profile-menu.component.scss'],
    imports: [NgClass],
})
export class MainProfileMenuComponent implements OnInit {
  readonly selectedChanged = output<string>();

  public selected: string = 'shouts';

  constructor() {}

  ngOnInit(): void {}

  select(value: string): void {
    this.selected = value;
    this.selectedChanged.emit(value);
  }
}
