import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PostsMetaComponent } from './posts-meta.component';

// Igual que posts-view: el componente se crea con el post ya cargado (dentro de @if), así que el setter de
// `post` corre antes de ngOnInit.
@Component({
  template: `@if (post) { <app-posts-meta [post]="post"></app-posts-meta> }`,
  imports: [PostsMetaComponent],
})
class HostComponent {
  post: unknown = { id: 10, puntos: 3, usuario: { userName: 'autor' } };
}

describe('PostsMetaComponent (Dar puntos)', () => {
  const posts = {
    getAvailableVotos: jasmine.createSpy('getAvailableVotos'),
    setVotos: jasmine.createSpy('setVotos'),
  };
  let usuario: unknown;

  const crear = async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: IHttpPostsService, useValue: posts },
        { provide: IHttpSecurityService, useValue: { getCurrentUser: () => usuario } },
        { provide: MatDialog, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(PostsMetaComponent, { set: { animations: [] } })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    posts.getAvailableVotos.calls.reset();
    posts.getAvailableVotos.and.returnValue(of(25));
    posts.setVotos.and.returnValue(of(true));
  });

  it('con sesión muestra hasta 10 opciones de puntos aunque el post llegue antes de ngOnInit', async () => {
    usuario = { usuario: { userName: 'lector' }, token: 't' };
    const fixture = await crear();

    expect(posts.getAvailableVotos).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.querySelectorAll('.barpuntos a, .barpuntos button, .barpuntos [role="button"]').length).toBe(10);
  });

  it('sin sesión no pide los puntos', async () => {
    usuario = { usuario: undefined, token: '' };
    await crear();
    expect(posts.getAvailableVotos).not.toHaveBeenCalled();
  });
});
