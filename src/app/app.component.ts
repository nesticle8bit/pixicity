import { DisplayComponentService } from './services/shared/displayComponents.service';
import { DisplayComponentModel } from './models/shared/displayComponent.model';
import { Component, DestroyRef, EventEmitter, inject, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { SEOService } from './services/shared/seo.service';
import { SEOModel } from './models/shared/seo.model';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly destroyRef = inject(DestroyRef);

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
    private meta: Meta,
  ) {
    this.displayComponentService
      .getDisplay()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (value: DisplayComponentModel) => (this.displayComponent = value),
      );

    this.seoService
      .getSEO()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: SEOModel) => {
      if (value.title) {
        this.title.setTitle(
          `${value.title} - Taringas - Inteligencia colectiva`,
        );
        this.meta.updateTag({ property: 'og:title', content: value.title });
        this.meta.updateTag({ name: 'twitter:title', content: value.title });
        this.meta.updateTag({
          property: 'og:site_name',
          content: 'Taringas! - Inteligencia colectiva',
        });
      }

      if (value.description) {
        this.meta.updateTag({
          name: 'description',
          content: value.description,
        });
        this.meta.updateTag({
          property: 'og:description',
          content: value.description,
        });
        this.meta.updateTag({
          name: 'twitter:description',
          content: value.description,
        });
      }

      if (value.tags?.length) {
        this.meta.updateTag({
          name: 'keywords',
          content: value.tags.join(', ').toLowerCase(),
        });
      }

      if (value.imageURL) {
        this.meta.updateTag({ property: 'og:image', content: value.imageURL });
        this.meta.updateTag({ name: 'twitter:image', content: value.imageURL });
        this.meta.updateTag({
          name: 'twitter:card',
          content: 'summary_large_image',
        });
      }

      if (value.type) {
        this.meta.updateTag({ property: 'og:type', content: value.type });
      }
    });

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
