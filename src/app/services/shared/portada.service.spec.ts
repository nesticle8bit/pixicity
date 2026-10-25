import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { PostListaViewModel } from 'src/app/models/posts/post-vm.model';
import { PortadaService } from './portada.service';

const LISTA_RESPALDO = { data: [], pagination: {} } as unknown as PaginatedData<PostListaViewModel>;

describe('PortadaService', () => {
  let service: PortadaService;
  let backend: HttpTestingController;

  const respuesta = {
    status: 200,
    errors: [],
    data: {
      posts: { data: [{ id: 1 }], pagination: { totalCount: 1 } },
      fijados: [{ id: 9 }],
      tags: [{ tag: 'angular', count: 3 }],
    },
  };

  function responder(): void {
    backend.expectOne((req) => req.url === `${environment.api}/api/portada`).flush(respuesta);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PortadaService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('pide la portada una sola vez y cada parte se entrega una sola vez', () => {
    service.iniciar('', 1);
    const tags: unknown[] = [];
    const fijados: unknown[] = [];

    service.tomar('tags', of([{ tag: 'respaldo', count: 1 }])).subscribe((v) => tags.push(v));
    service.tomar('fijados', of([])).subscribe((v) => fijados.push(v));
    responder();
    // Segunda vez (p. ej. una recarga en vivo): va al endpoint propio.
    service.tomar('tags', of([{ tag: 'respaldo', count: 1 }])).subscribe((v) => tags.push(v));

    expect(tags).toEqual([respuesta.data.tags, [{ tag: 'respaldo', count: 1 }]]);
    expect(fijados).toEqual([respuesta.data.fijados]);
  });

  it('el listado solo sale de la portada si coinciden categoría y página', () => {
    service.iniciar('juegos', 1);
    const otraPagina: unknown[] = [];
    const misma: unknown[] = [];

    service.tomarPosts('juegos', 2, of(LISTA_RESPALDO)).subscribe((v) => otraPagina.push(v));
    service.tomarPosts('juegos', 1, of(LISTA_RESPALDO)).subscribe((v) => misma.push(v));
    backend.expectOne((req) => req.url === `${environment.api}/api/portada` && req.params.get('query') === 'juegos' && req.params.get('page') === '1').flush(respuesta);

    expect(otraPagina).toEqual([LISTA_RESPALDO]);
    expect(misma).toEqual([respuesta.data.posts]);
  });

  it('si la portada falla o no trae la parte, usa el respaldo', () => {
    service.iniciar('', 1);
    const tags: unknown[] = [];

    service.tomar('tags', of([{ tag: 'respaldo', count: 1 }])).subscribe((v) => tags.push(v));
    backend.expectOne(`${environment.api}/api/portada?page=1&pageCount=49&query=`).flush('caído', { status: 500, statusText: 'Error' });

    expect(tags).toEqual([[{ tag: 'respaldo', count: 1 }]]);
  });

  it('sin portada iniciada (widget fuera de la portada) usa siempre el respaldo', () => {
    const carga = service.iniciar('', 1);
    service.terminar(carga);
    const tags: unknown[] = [];

    service.tomar('tags', of([])).subscribe((v) => tags.push(v));

    expect(tags).toEqual([[]]);
    backend.expectNone(`${environment.api}/api/portada?page=1&pageCount=49&query=`);
  });
});
