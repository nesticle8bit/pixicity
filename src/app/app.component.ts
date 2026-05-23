import { DisplayComponentService } from './services/shared/displayComponents.service';
import { DisplayComponentModel } from './models/shared/displayComponent.model';
import { Component, EventEmitter, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SEOService } from './services/shared/seo.service';
import { SEOModel } from './models/shared/seo.model';
import { Meta, Title } from '@angular/platform-browser';

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
        this.title.setTitle(`${value.title} - Pixicity - Ciudad Pixelada`);
        this.meta.updateTag({ property: 'og:title', content: value.title });
        this.meta.updateTag({ name: 'twitter:title', content: value.title });
        this.meta.updateTag({ property: 'og:site_name', content: 'Pixicity' });
      }

      if (value.description) {
        this.meta.updateTag({ name: 'description', content: value.description });
        this.meta.updateTag({ property: 'og:description', content: value.description });
        this.meta.updateTag({ name: 'twitter:description', content: value.description });
      }

      if (value.tags?.length) {
        this.meta.updateTag({ name: 'keywords', content: value.tags.join(', ').toLowerCase() });
      }

      if (value.imageURL) {
        this.meta.updateTag({ property: 'og:image', content: value.imageURL });
        this.meta.updateTag({ name: 'twitter:image', content: value.imageURL });
        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      }

      if (value.type) {
        this.meta.updateTag({ property: 'og:type', content: value.type });
      }
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });

    this.welcome();
  }

  welcome(): void {
    console.log(
      ` _______________________\r\n< Bienvenido a Pixicity >\r\n -----------------------\r\n         \\\r\n          \\\r\n           ___\r\n          (o o)\r\n         (  V  )\r\n        \/--m-m-\r\n`
    );
  }
}
