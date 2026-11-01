import { avatarInicial, colorDe, COLORES_AVATAR, inicialDe } from './avatar-inicial';

describe('avatar-inicial', () => {
  it('toma la primera letra o número, en mayúscula', () => {
    expect(inicialDe('juan')).toBe('J');
    expect(inicialDe('_ñandu')).toBe('Ñ');
    expect(inicialDe('99luftballons')).toBe('9');
    expect(inicialDe('__')).toBe('?');
    expect(inicialDe(null)).toBe('?');
  });

  it('da siempre el mismo color al mismo usuario, sin importar mayúsculas', () => {
    expect(colorDe('Juan')).toBe(colorDe('juan'));
    expect(COLORES_AVATAR).toContain(colorDe('juan') as (typeof COLORES_AVATAR)[number]);
    // Nombres parecidos no caen todos en el mismo color.
    const colores = new Set(['juan1', 'juan2', 'juan3', 'juan4', 'juan5', 'juan6'].map(colorDe));
    expect(colores.size).toBeGreaterThan(2);
  });

  it('arma un SVG con la inicial y el color', () => {
    const svg = decodeURIComponent(avatarInicial('maria').replace('data:image/svg+xml;charset=utf-8,', ''));
    expect(svg).toContain(`fill="${colorDe('maria')}"`);
    expect(svg).toContain('>M</text>');
  });
});
