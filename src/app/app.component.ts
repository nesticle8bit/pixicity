import { Component } from '@angular/core';
import { DisplayComponentModel } from './models/shared/displayComponent.model';
import { DisplayComponentService } from './services/shared/displayComponents.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'pixicity';
  public displayComponent: DisplayComponentModel = {
    mainMenu: true
  };

  constructor(
    private displayComponentService: DisplayComponentService
  ) {
    this.displayComponentService.getDisplay().subscribe((value: DisplayComponentModel) => this.displayComponent = value);
  }
}
