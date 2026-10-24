import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { SEOModel } from 'src/app/models/shared/seo.model';
import { nombreDesdeSlug, SeoTitleStrategy, sumarContexto, tituloConParametro } from './seo-title.strategy';
import { SEOService } from './seo.service';

@Component({ template: '' })
class VistaSinSeoComponent {}

/** Publica su propio SEO al crearse, como las vistas con datos (post, perfil...). */
@Component({ template: '' })
class VistaConSeoComponent {
  constructor() {
    TestBed.inject(SEOService).setSEO({ title: 'Título de la vista', description: '', type: 'website', imageURL: '', tags: [] });
  }
}

describe('SeoTitleStrategy', () => {
  let publicados: SEOModel[];
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'contacto', component: VistaSinSeoComponent, title: 'Contacto', data: { descripcion: 'Escribinos' } },
          {
            path: 'privado',
            data: { noIndex: true },
            children: [{ path: 'mensajes', component: VistaSinSeoComponent, title: 'Mensajes' }],
          },
          { path: 'perfil/:userName', component: VistaSinSeoComponent, title: tituloConParametro('userName', (u) => `@${u} · Perfil`) },
          { path: 'post', component: VistaConSeoComponent, title: 'Post' },
        ]),
        { provide: TitleStrategy, useClass: SeoTitleStrategy },
      ],
    });

    // Monta un <router-outlet> real: las vistas se crean durante la navegación, como en la app.
    harness = await RouterTestingHarness.create();
    publicados = [];
    TestBed.inject(SEOService).getSEO().subscribe((seo) => publicados.push(seo));
  });

  const navegar = async (url: string) => {
    TestBed.inject(SEOService).iniciarNavegacion();
    await harness.navigateByUrl(url);
  };

  it('publica el título y la descripción de la ruta', async () => {
    await navegar('/contacto');

    expect(publicados.at(-1)).toEqual(jasmine.objectContaining({ title: 'Contacto', description: 'Escribinos' }));
  });

  it('hereda noIndex de la ruta padre', async () => {
    await navegar('/privado/mensajes');

    expect(publicados.at(-1)).toEqual(jasmine.objectContaining({ title: 'Mensajes', noIndex: true }));
  });

  it('arma el título con los parámetros de la ruta', async () => {
    await navegar('/perfil/juan');

    expect(publicados.at(-1)?.title).toBe('@juan · Perfil');
  });

  it('no pisa el SEO que la vista publicó durante la navegación', async () => {
    await navegar('/post');

    expect(publicados.at(-1)?.title).toBe('Título de la vista');
  });

  it('repite el SEO de la vista al cambiar solo los query params', async () => {
    await navegar('/post');
    await navegar('/post?page=2');

    expect(publicados.at(-1)?.title).toBe('Título de la vista');
  });

  it('una vista sin SEO propio no hereda el de la anterior', async () => {
    await navegar('/post');
    await navegar('/contacto');

    expect(publicados.at(-1)?.title).toBe('Contacto');
  });
});

describe('helpers de títulos', () => {
  it('nombreDesdeSlug capitaliza cada palabra', () => {
    expect(nombreDesdeSlug('musica-y-videos')).toBe('Musica Y Videos');
  });

  it('sumarContexto agrega el contexto solo si entra', () => {
    expect(sumarContexto('Mi foto', 'Foto de @juan')).toBe('Mi foto · Foto de @juan');
    expect(sumarContexto('x'.repeat(55), 'Comunidad')).toBe('x'.repeat(55));
    expect(sumarContexto('Mi foto', null)).toBe('Mi foto');
  });
});
