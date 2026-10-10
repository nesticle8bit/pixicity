import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { HomeLastPostsComponent } from './home/home-last-posts/home-last-posts.component';
import { CategoriesSelectorComponent } from './sections/categories-selector/categories-selector.component';
import { PostRelatedPostsComponent } from './posts/post-related-posts/post-related-posts.component';

/**
 * Regresiones del patrón "el @Input llega antes de ngOnInit" (como el bug de Dar puntos) y de respuestas viejas
 * que pisan a las nuevas cuando el componente se reutiliza al navegar.
 */
describe('Carreras de carga', () => {
  describe('HomeLastPostsComponent con ?page=3', () => {
    @Component({
      template: `<app-home-last-posts [categoria]="categoria"></app-home-last-posts>`,
      imports: [HomeLastPostsComponent],
    })
    class HostComponent {
      categoria = 'info';
    }

    it('pide una sola vez, y la página de la URL (antes pedía la 1 y la 3 a la vez)', async () => {
      const paginas: number[] = [];
      const posts = {
        getPosts: jasmine.createSpy('getPosts').and.callFake(() => {
          paginas.push(TestBed.inject(PaginationService).page);
          return of({ data: [], pagination: { totalCount: 0 } });
        }),
        getStickyPosts: () => of([]),
      };
      await TestBed.configureTestingModule({
        imports: [HostComponent],
        providers: [
          provideRouter([]),
          { provide: IHttpPostsService, useValue: posts },
          { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({ page: '3' })) } },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .overrideComponent(HomeLastPostsComponent, { remove: { imports: [CategoriesSelectorComponent] }, add: { schemas: [NO_ERRORS_SCHEMA] } })
        .compileComponents();
      TestBed.createComponent(HostComponent).detectChanges();

      expect(posts.getPosts).toHaveBeenCalledTimes(1);
      expect(paginas).toEqual([3]);
    });
  });

  describe('PostRelatedPostsComponent al pasar de un post a otro', () => {
    @Component({
      template: `<app-post-related-posts [post]="post"></app-post-related-posts>`,
      imports: [PostRelatedPostsComponent],
    })
    class HostComponent {
      post: { id: number } = { id: 1 };
    }

    it('la respuesta tardía del post anterior no reemplaza a la del actual', async () => {
      const respuestas: Record<number, Subject<unknown[]>> = { 1: new Subject(), 2: new Subject() };
      await TestBed.configureTestingModule({
        imports: [HostComponent],
        providers: [
          provideRouter([]),
          { provide: IHttpPostsService, useValue: { getRelatedPosts: (id: number) => respuestas[id] } },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      fixture.componentInstance.post = { id: 2 };
      fixture.detectChanges();
      respuestas[2].next([{ id: 20, titulo: 'Del post 2', categoria: { icono: 'i', seo: 'info' } }]);
      respuestas[1].next([{ id: 10, titulo: 'Del post 1 (tarde)', categoria: { icono: 'i', seo: 'info' } }]);
      fixture.detectChanges();

      const relacionado = fixture.debugElement.children[0].componentInstance as PostRelatedPostsComponent;
      expect(relacionado.relatedPosts).toEqual([{ id: 20, titulo: 'Del post 2', categoria: { icono: 'i', seo: 'info' } }] as never);
    });
  });
});
