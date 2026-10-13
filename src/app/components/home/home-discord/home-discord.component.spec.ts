import { TestBed } from '@angular/core/testing';
import { HomeDiscordComponent } from './home-discord.component';

describe('HomeDiscordComponent', () => {
  function crear() {
    const fixture = TestBed.createComponent(HomeDiscordComponent);
    return { fixture, c: fixture.componentInstance };
  }

  const respuesta = (cuerpo: unknown, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(cuerpo) } as Response);

  it('muestra nombre, en línea y avatares del widget; ignora URLs que no son de Discord', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.returnValue(
      respuesta({
        name: 'Taringa!',
        presence_count: 42,
        instant_invite: 'https://evil.example/x',
        members: [
          { id: '1', username: 'ana', avatar_url: 'https://cdn.discordapp.com/a.png' },
          { id: '2', username: 'beto', avatar_url: 'https://evil.example/b.png' },
        ],
      })
    );
    const { fixture, c } = crear();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r));

    expect(fetchSpy.calls.mostRecent().args[1]).toEqual(jasmine.objectContaining({ credentials: 'omit' }));
    expect(c.nombre()).toBe('Taringa!');
    expect(c.enLinea()).toBe(42);
    expect(c.avatares().map((a) => a.nombre)).toEqual(['ana']);
    expect(c.restantes()).toBe(41);
    expect(c.invitacion()).toBe('https://discord.gg/rBs8xGTV5S'); // la invitación ajena se descarta
  });

  it('si Discord falla, la tarjeta queda como invitación sin datos en vivo', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.reject(new Error('caído')));
    const { fixture, c } = crear();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r));
    fixture.detectChanges();

    expect(c.enLinea()).toBeNull();
    const enlace: HTMLAnchorElement = fixture.nativeElement.querySelector('a.discord');
    expect(enlace.href).toBe('https://discord.gg/rBs8xGTV5S');
    expect(enlace.rel).toContain('noopener');
  });
});
