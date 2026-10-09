import { environment } from 'src/environments/environment';
import { ServerApiInterceptor } from './server-api.interceptor';

describe('ServerApiInterceptor (SSR)', () => {
  const proceso = globalThis as unknown as { process?: { env: Record<string, string | undefined> } };
  let original: typeof proceso.process;

  beforeEach(() => {
    original = proceso.process;
    proceso.process = { env: { API_INTERNAL_URL: 'http://api-interna:5000/' } };
  });

  afterEach(() => {
    proceso.process = original;
  });

  it('manda /api e /images al API interno', () => {
    const i = new ServerApiInterceptor();
    expect(i.reescribir('/api/posts/getPosts?page=1')).toBe('http://api-interna:5000/api/posts/getPosts?page=1');
    expect(i.reescribir(`${environment.publicUrl}/api/tops/getTopPosts`)).toBe('http://api-interna:5000/api/tops/getTopPosts');
    expect(i.reescribir('/images/fotos/a.jpg')).toBe('http://api-interna:5000/images/fotos/a.jpg');
  });

  it('no toca otras URLs', () => {
    const i = new ServerApiInterceptor();
    expect(i.reescribir('https://i.imgur.com/x.png')).toBe('https://i.imgur.com/x.png');
    expect(i.reescribir('/assets/i18n/es.json')).toBe('/assets/i18n/es.json');
  });

  it('sin API_INTERNAL_URL deja las URLs como están', () => {
    proceso.process = { env: {} };
    expect(new ServerApiInterceptor().reescribir('/api/x')).toBe('/api/x');
  });
});
