import { DisplayComponentService } from './services/shared/displayComponents.service';
import { DisplayComponentModel } from './models/shared/displayComponent.model';
import {
  Component,
  EventEmitter,
  Inject,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SEOService } from './services/shared/seo.service';
import { SEOModel } from './models/shared/seo.model';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public displayComponent: DisplayComponentModel = {
    mainMenu: true,
    footer: true,
    searchFooter: true,
    submenu: true,
    background: '',
  };

  constructor(
    private displayComponentService: DisplayComponentService,
    @Inject(PLATFORM_ID) private platformId: any,
    private seoService: SEOService,
    private router: Router,
    private title: Title,
    private meta: Meta
  ) {
    this.displayComponentService
      .getDisplay()
      .subscribe(
        (value: DisplayComponentModel) => (this.displayComponent = value)
      );

    this.seoService.getSEO().subscribe((value: SEOModel) => {
      if (value.title) {
        this.title.setTitle(`${value.title} - ${this.title.getTitle()}`);

        this.meta.addTag({
          name: 'og:title',
          content: value.title,
        });

        this.meta.addTag({
          name: 'twitter:title',
          content: value.title,
        });

        this.meta.addTag({
          name: 'og:site_name',
          content: value.title,
        });
      }

      if (value.tags) {
        this.meta.addTag({
          name: 'description',
          content: value.tags.join()?.toLowerCase(),
        });
      }

      if (value.imageURL) {
        this.meta.addTag({
          name: 'og:image',
          content: value.imageURL,
        });

        this.meta.addTag({
          name: 'twitter:image',
          content: value.imageURL,
        });

        this.meta.addTag({
          name: 'twitter:card',
          content: value.imageURL,
        });
      }

      if (value.type) {
        this.meta.addTag({
          name: 'og:type',
          content: value.type,
        });
      }
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }

      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo(0, 0);
      }
    });

    this.welcome();
  }

  welcome(): void {
    console.log(
      ` _______________________\r\n< Bienvenido a Pixicity >\r\n -----------------------\r\n         \\\r\n          \\\r\n           ___\r\n          (o o)\r\n         (  V  )\r\n        \/--m-m-\r\n`
    );
  }
}
