import { partirTexto } from './texto-enlazado.component';

describe('partirTexto (#hashtags y @menciones en shouts)', () => {
  it('separa texto, tags (con acentos) y menciones', () => {
    expect(partirTexto('Hola @ana, mirá #Fútbol hoy')).toEqual([
      { tipo: 'texto', valor: 'Hola ' },
      { tipo: 'mencion', valor: 'ana' },
      { tipo: 'texto', valor: ', mirá ' },
      { tipo: 'tag', valor: 'Fútbol' },
      { tipo: 'texto', valor: ' hoy' },
    ]);
  });

  it('no confunde entidades HTML, correos ni "#" sueltos con tags o menciones', () => {
    const partes = partirTexto('Precio &#36;5, escribe a ana@correo.com o al # 3');
    expect(partes.every((p) => p.tipo === 'texto')).toBeTrue();
  });
});
