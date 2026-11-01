import { bundlePrincipal } from './app-instalable.service';

describe('bundlePrincipal', () => {
  it('encuentra el main-HASH.js del index.html publicado', () => {
    const html = '<head><link rel="modulepreload" href="chunk-AB12CD34.js"></head><body><app-root></app-root>' +
      '<script src="polyfills-ZZ11YY22.js" type="module"></script><script src="main-W336R5XR.js" type="module"></script></body>';
    expect(bundlePrincipal(html)).toBe('main-W336R5XR.js');
  });

  it('acepta la ruta con barra inicial y devuelve null si no hay bundle', () => {
    expect(bundlePrincipal('<script type="module" src="/main-ABCDEF12.js"></script>')).toBe('main-ABCDEF12.js');
    expect(bundlePrincipal('<html><body>mantenimiento</body></html>')).toBeNull();
  });
});
