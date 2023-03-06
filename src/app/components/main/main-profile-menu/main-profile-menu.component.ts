import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-main-profile-menu',
  templateUrl: './main-profile-menu.component.html',
  styleUrls: ['./main-profile-menu.component.scss'],
})
export class MainProfileMenuComponent implements OnInit {
  @Output() selectedChanged = new EventEmitter<string>();

  public selected: string = 'shouts';

  constructor() {}

  ngOnInit(): void {}

  select(value: string): void {
    this.selected = value;
    this.selectedChanged.emit(value);
  }
}
