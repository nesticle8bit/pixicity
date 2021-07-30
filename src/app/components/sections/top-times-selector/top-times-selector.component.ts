import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-top-times-selector',
  templateUrl: './top-times-selector.component.html',
  styleUrls: ['./top-times-selector.component.scss']
})
export class TopTimesSelectorComponent implements OnInit {
  public displayMenu: boolean = false;
  
  constructor() { }

  ngOnInit(): void {
  }

}
