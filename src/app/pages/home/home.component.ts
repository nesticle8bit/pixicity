import { Component, OnInit } from '@angular/core';
import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public displayComponent: DisplayComponentModel = {
    mainMenu: true
  };
  
  constructor(
    private displayComponentService: DisplayComponentService
  ) { }

  ngOnInit(): void {
    this.displayComponentService.setDisplay(this.displayComponent);
  }
}
