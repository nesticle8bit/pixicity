import { DisplayComponentService } from './services/shared/displayComponents.service';
import { DisplayComponentModel } from './models/shared/displayComponent.model';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'pixicity';

  public displayComponent: DisplayComponentModel = {
    mainMenu: true,
    footer: true,
    searchFooter: true,
    submenu: true,
  };

  constructor(private displayComponentService: DisplayComponentService) {
    this.displayComponentService
      .getDisplay()
      .subscribe(
        (value: DisplayComponentModel) => (this.displayComponent = value)
      );
  }
}
