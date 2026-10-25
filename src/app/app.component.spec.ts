import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { AppComponent } from './app.component';
import { DisplayComponentService } from './services/shared/displayComponents.service';
import { SEOService } from './services/shared/seo.service';
import { AnunciosService } from './services/shared/anuncios.service';
import { ScriptsGlobalesService } from './services/shared/scripts-globales.service';

describe('AppComponent', () => {
  let display$: BehaviorSubject<any>;
  let seo$: BehaviorSubject<any>;

  const create = () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  beforeEach(async () => {
    display$ = new BehaviorSubject<any>({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
    seo$ = new BehaviorSubject<any>({});

    await TestBed.configureTestingModule({
    imports: [AppComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        provideRouter([]),
        { provide: DisplayComponentService, useValue: { getDisplay: () => display$.asObservable() } },
        { provide: SEOService, useValue: { getSEO: () => seo$.asObservable(), iniciarNavegacion: () => {} } },
        { provide: AnunciosService, useValue: { precargar: () => {} } },
        { provide: ScriptsGlobalesService, useValue: { insertar: () => {} } },
    ],
})
      // Solo se prueba la lógica del componente raíz (SEO y visibilidad de secciones).
      .overrideComponent(AppComponent, { set: { template: '' } })
      .compileComponents();
  });

  it('se crea', () => {
    expect(create()).toBeTruthy();
  });

  it('refleja qué secciones mostrar según el servicio de display', () => {
    const app = create();

    display$.next({ mainMenu: false, footer: false, searchFooter: false, submenu: false, background: '' });

    expect(app.displayComponent.mainMenu).toBeFalse();
    expect(app.displayComponent.footer).toBeFalse();
  });

  it('actualiza el título de la página con el SEO de la ruta', () => {
    create();

    seo$.next({ title: 'Mis posts' });

    expect(TestBed.inject(Title).getTitle()).toContain('Mis posts');
  });

  it('sin título ni descripción propios vuelve a los del sitio en vez de dejar los de la página anterior', () => {
    create();

    seo$.next({ title: 'Mis posts', description: 'Descripción vieja', tags: ['viejo'] });
    seo$.next({ title: '', description: '', tags: [] });

    expect(TestBed.inject(Title).getTitle()).toContain('Inteligencia colectiva');
    const meta = TestBed.inject(Meta);
    expect(meta.getTag("name='description'")?.content).not.toBe('Descripción vieja');
    expect(meta.getTag("name='keywords'")).toBeNull();
  });

  it('agrega la página al título de los listados paginados', () => {
    create();
    spyOnProperty(TestBed.inject(Router), 'url', 'get').and.returnValue('/fotos?page=3');

    seo$.next({ title: 'Fotos' });

    expect(TestBed.inject(Title).getTitle()).toContain('Fotos - Página 3');
  });
});
