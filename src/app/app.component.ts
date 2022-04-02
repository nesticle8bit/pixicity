import { DisplayComponentService } from './services/shared/displayComponents.service';
import { DisplayComponentModel } from './models/shared/displayComponent.model';
import { Component, EventEmitter, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

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
    background: ''
  };

  constructor(
    private displayComponentService: DisplayComponentService,
    private router: Router
  ) {
    this.displayComponentService
      .getDisplay()
      .subscribe(
        (value: DisplayComponentModel) => (this.displayComponent = value)
      );

      this.router.events.subscribe((evt) => {
        if (!(evt instanceof NavigationEnd)) {
            return;
        }
        window.scrollTo(0, 0)
    });

    this.welcome();
  }

  welcome(): void {
    console.log(
      ` _______________________\r\n< Bienvenido a Pixicity >\r\n -----------------------\r\n         \\\r\n          \\\r\n           ___\r\n          (o o)\r\n         (  V  )\r\n        \/--m-m-\r\n`
    );
  }
}
