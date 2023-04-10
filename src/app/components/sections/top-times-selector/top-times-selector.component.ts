import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-top-times-selector',
  templateUrl: './top-times-selector.component.html',
  styleUrls: ['./top-times-selector.component.scss'],
})
export class TopTimesSelectorComponent implements OnInit {
  public selection: string = 'all';
  @Output() selectedDate = new EventEmitter<any>();

  public displayMenu: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  changeTop(date: string): void {
    this.selection = date;
    this.selectedDate.emit(date);

    this.displayMenu = false;
  }
}
