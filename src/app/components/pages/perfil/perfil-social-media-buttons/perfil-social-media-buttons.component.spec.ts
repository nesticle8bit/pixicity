import { redDiscord } from './perfil-social-media-buttons.component';

describe('redDiscord', () => {
  it('vacío: no muestra Discord', () => {
    expect(redDiscord('')).toBeNull();
    expect(redDiscord(null)).toBeNull();
  });

  it('ID numérico o URL de perfil: enlaza a discord.com/users', () => {
    expect(redDiscord('123456789012345678')?.url).toBe('https://discord.com/users/123456789012345678');
    expect(redDiscord('https://discord.com/users/123456789012345678/')?.url).toBe('https://discord.com/users/123456789012345678');
  });

  it('invitación: enlaza a discord.gg', () => {
    expect(redDiscord('discord.gg/pixicity')?.url).toBe('https://discord.gg/pixicity');
    expect(redDiscord('https://discord.com/invite/abc-123')?.url).toBe('https://discord.gg/abc-123');
  });

  it('nombre de usuario: sin enlace (se copia)', () => {
    const red = redDiscord('@juan.perez');
    expect(red?.url).toBeNull();
    expect(red?.usuario).toBe('juan.perez');
  });
});
