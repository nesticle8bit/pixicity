import { completarLinksOcultos, tieneLinksBloqueados } from './links-ocultos.service';

describe('links ocultos (helpers)', () => {
  const bloqueado = '<div class="links-ocultos links-ocultos--bloqueado"></div>';

  it('detecta los recuadros que el API mandó vacíos', () => {
    expect(tieneLinksBloqueados(`<p>hola</p>${bloqueado}`)).toBeTrue();
    expect(tieneLinksBloqueados('<div class="links-ocultos"><p>ya visible</p></div>')).toBeFalse();
    expect(tieneLinksBloqueados(null)).toBeFalse();
  });

  it('pone cada bloque en su recuadro, en orden, y les saca la marca de bloqueado', () => {
    const html = completarLinksOcultos(`<p>a</p>${bloqueado}<p>b</p>${bloqueado}`, [
      '<p><a href="https://mega.nz/1">uno</a></p>',
      '<p>clave 123</p>',
    ]);

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const cajas = doc.querySelectorAll('div.links-ocultos');
    expect(cajas.length).toBe(2);
    expect(cajas[0].querySelector('a')?.getAttribute('href')).toBe('https://mega.nz/1');
    expect(cajas[1].textContent).toBe('clave 123');
    expect(tieneLinksBloqueados(html)).toBeFalse();
    expect(html).toContain('<p>b</p>');
  });
});
