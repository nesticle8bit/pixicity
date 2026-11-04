import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { TestBed } from '@angular/core/testing';
import { EmojisPopoverService } from '../../bottom-sheets/bottom-sheets-emojis/emojis-popover.service';
import { of } from 'rxjs';
import { ComentarioHilo, ComentariosAcciones } from 'src/app/models/shared/comentario-hilo.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { ComentariosComponent } from './comentarios.component';

function comentario(parcial: Partial<ComentarioHilo> & { id: number }): ComentarioHilo {
  return {
    parentId: null,
    contenido: `texto ${parcial.id}`,
    fecha: '2026-10-01T00:00:00Z',
    fechaEdicion: null,
    userName: 'otro',
    avatar: null,
    rango: null,
    votos: 0,
    miVoto: 0,
    votosArriba: 0,
    votosAbajo: 0,
    fijado: false,
    denunciasPendientes: 0,
    ...parcial,
  };
}

describe('ComentariosComponent', () => {
  let componente: ComentariosComponent;
  let acciones: jasmine.SpyObj<ComentariosAcciones>;
  let usuario: { userName: string; rango: string } | undefined;

  beforeEach(() => {
    usuario = { userName: 'ana', rango: 'Novato' };
    acciones = jasmine.createSpyObj<ComentariosAcciones>('acciones', ['comentar', 'editar', 'eliminar', 'votar', 'fijar', 'denunciar']);

    TestBed.configureTestingModule({
      providers: [
        { provide: IHttpSecurityService, useValue: { getCurrentUser: () => ({ usuario, token: 't' }) } },
        { provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['confirm', 'success', 'warning']) },
        { provide: EmojisPopoverService, useValue: { cerrar: () => {} } },
        { provide: IHttpPerfilService, useValue: jasmine.createSpyObj('IHttpPerfilService', ['subirImagenShout']) },
      ],
    });

    componente = TestBed.runInInjectionContext(() => new ComentariosComponent());
    componente.acciones = acciones;
  });

  it('arma el árbol: respuestas bajo su raíz y raíces ordenadas por votos, con los fijados primero', () => {
    componente.comentarios = [
      comentario({ id: 1, votos: 1 }),
      comentario({ id: 2, votos: 9 }),
      comentario({ id: 3, votos: 0, fijado: true }),
      comentario({ id: 4, parentId: 2 }),
    ];

    expect(componente.arbol.map((c) => c.id)).toEqual([3, 2, 1]);
    expect(componente.arbol[1].respuestas?.map((r) => r.id)).toEqual([4]);
    expect(componente.total).toBe(4);
  });

  it('marca como destacado el raíz más votado solo desde 3 votos', () => {
    componente.comentarios = [comentario({ id: 1, votos: 2 })];
    expect(componente.arbol[0].destacado).toBeFalse();

    componente.comentarios = [comentario({ id: 1, votos: 3 }), comentario({ id: 2, votos: 1 })];
    expect(componente.arbol.find((c) => c.id === 1)?.destacado).toBeTrue();
  });

  it('responder a una respuesta envía el id respondido y la cuelga del raíz', () => {
    acciones.comentar.and.returnValue(of(10));
    componente.comentarios = [comentario({ id: 1 }), comentario({ id: 2, parentId: 1 })];
    const respuesta = componente.arbol[0].respuestas![0];

    componente.replyText = 'hola';
    componente.enviarRespuesta(respuesta);

    expect(acciones.comentar).toHaveBeenCalledWith('hola', 2);
    expect(componente.arbol[0].respuestas?.map((r) => r.id)).toEqual([2, 10]);
  });

  it('borrar un comentario quita también sus respuestas', async () => {
    const notificaciones = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    notificaciones.confirm.and.resolveTo(true);
    acciones.eliminar.and.returnValue(of(true));
    componente.comentarios = [comentario({ id: 1 }), comentario({ id: 2, parentId: 1 }), comentario({ id: 3 })];
    let total = -1;
    componente.totalCambio.subscribe((t) => (total = t));

    await componente.eliminar(componente.arbol.find((c) => c.id === 1)!);

    expect(componente.total).toBe(1);
    expect(total).toBe(1);
  });

  it('al cambiar el voto actualiza el total y los contadores de arriba/abajo', () => {
    acciones.votar.and.returnValue(of({ total: -1, miVoto: -1 }));
    componente.comentarios = [comentario({ id: 1, votos: 1, miVoto: 1, votosArriba: 1 })];
    const c = componente.arbol[0];

    componente.votar(c, -1);

    expect(c.votos).toBe(-1);
    expect(c.miVoto).toBe(-1);
    expect(c.votosArriba).toBe(0);
    expect(c.votosAbajo).toBe(1);
  });

  it('colapsa por puntaje muy bajo o por muchas denuncias, y se puede volver a mostrar', () => {
    componente.comentarios = [comentario({ id: 1, votos: -5 }), comentario({ id: 2, denunciasPendientes: 3 })];
    const [a, b] = componente.arbol;

    expect(componente.estaColapsado(a)).toBeTrue();
    expect(componente.estaColapsado(b)).toBeTrue();

    componente.mostrarColapsado(a);
    expect(componente.estaColapsado(a)).toBeFalse();
  });

  it('permisos: el autor edita y borra lo suyo; los demás pueden denunciar', () => {
    componente.comentarios = [comentario({ id: 1, userName: 'ana' }), comentario({ id: 2, userName: 'otro' })];
    const [propio, ajeno] = [componente.arbol.find((c) => c.id === 1)!, componente.arbol.find((c) => c.id === 2)!];

    expect(componente.puedeEditar(propio)).toBeTrue();
    expect(componente.puedeBorrar(propio)).toBeTrue();
    expect(componente.puedeDenunciar(propio)).toBeFalse();

    expect(componente.puedeEditar(ajeno)).toBeFalse();
    expect(componente.puedeBorrar(ajeno)).toBeFalse();
    expect(componente.puedeDenunciar(ajeno)).toBeTrue();
  });

  it('el staff edita lo ajeno salvo que la sección lo impida (posts), y el dueño del contenido puede borrar', () => {
    usuario = { userName: 'mod', rango: 'Moderador' };
    componente.comentarios = [comentario({ id: 1, userName: 'otro' })];
    const c = componente.arbol[0];

    expect(componente.puedeEditar(c)).toBeTrue();
    componente.staffPuedeEditar = false;
    expect(componente.puedeEditar(c)).toBeFalse();

    usuario = { userName: 'dueño', rango: 'Novato' };
    expect(componente.puedeBorrar(c)).toBeFalse();
    componente.puedeBorrarTodos = true;
    expect(componente.puedeBorrar(c)).toBeTrue();
  });

  it('solo se pueden fijar comentarios raíz, y solo si la sección lo permite', () => {
    componente.comentarios = [comentario({ id: 1 }), comentario({ id: 2, parentId: 1 })];
    const raiz = componente.arbol[0];
    const respuesta = raiz.respuestas![0];

    expect(componente.puedeFijarComentario(raiz)).toBeFalse();
    componente.puedeFijar = true;
    expect(componente.puedeFijarComentario(raiz)).toBeTrue();
    expect(componente.puedeFijarComentario(respuesta)).toBeFalse();
  });

  it('formatear deja el HTML básico, escapa el resto y no permite atributos', () => {
    const html = componente.formatear(
      '<b>negrita</b> <u>sub</u> <script>alert(1)</script> <b onclick="x()">no</b> <img src=x onerror=alert(1)> a &amp; b');

    expect(html).toContain('<b>negrita</b>');
    expect(html).toContain('<u>sub</u>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;b onclick=');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('a &amp; b');
  });

  it('formatear acepta <a href="https://..."> y descarta javascript:', () => {
    const bueno = componente.formatear('<a href="https://x.com/a?b=1&amp;c=2">mi web</a>');
    const malo = componente.formatear('<a href="javascript:alert(1)">x</a>');

    expect(bueno).toContain('<a href="https://x.com/a?b=1&amp;c=2" target="_blank" rel="nofollow noopener">mi web</a>');
    expect(bueno.match(/<a /g)?.length).toBe(1);
    expect(malo).not.toContain('<a href="javascript');
  });

  it('formatear escapa HTML y enlaza URLs y menciones', () => {
    const html = componente.formatear('<div>hola</div> @ana https://x.com');

    expect(html).toContain('&lt;div&gt;hola&lt;/div&gt;');
    expect(html).toContain('<a href="/perfil/ana">@ana</a>');
    expect(html).toContain('<a href="https://x.com"');
  });

  it('formatear aplica negrita, cursiva, tachado y [texto](url)', () => {
    const html = componente.formatear('**fuerte** *suave* ~~viejo~~ [mi web](https://x.com/a_b) 2*3*4');

    expect(html).toContain('<strong>fuerte</strong>');
    expect(html).toContain('<em>suave</em>');
    expect(html).toContain('<del>viejo</del>');
    expect(html).toContain('<a href="https://x.com/a_b" target="_blank" rel="nofollow noopener">mi web</a>');
    // La URL del enlace con texto no se vuelve a enlazar sola, y un * entre números no es cursiva.
    expect(html.match(/<a /g)?.length).toBe(1);
    expect(html).toContain('2*3*4');
  });

  it('formatear no deja salir de los atributos ni enlaza javascript:', () => {
    const html = componente.formatear('[x](https://a.com/"onmouseover="alert(1)) [y](javascript:alert(1))');

    expect(html).not.toContain('"onmouseover');
    expect(html).not.toContain('href="javascript');
  });

  it('formatear muestra como imagen las subidas al sitio y los enlaces https a imágenes', () => {
    const guid = 'a'.repeat(32);
    const propia = componente.formatear(`https://taringas.net/images/shouts/ana/${guid}.webp`);
    const externa = componente.formatear('https://i.imgur.com/abc.PNG');
    const http = componente.formatear('http://otro.com/foto.jpg');
    const pagina = componente.formatear('https://otro.com/foto.html');

    expect(propia).toContain('<img src="https://taringas.net/images/shouts/ana/');
    expect(externa).toContain('<img src="https://i.imgur.com/abc.PNG"');
    expect(http).not.toContain('<img');
    expect(pagina).not.toContain('<img');
  });

  // - Barra de formato

  function campo(texto: string, inicio: number, fin = inicio): HTMLTextAreaElement {
    const ta = document.createElement('textarea');
    document.body.appendChild(ta);
    componente.nuevoComentario = texto;
    ta.value = texto;
    ta.setSelectionRange(inicio, fin);
    return ta;
  }

  it('la barra pone el formato y el mismo botón lo quita', () => {
    const ta = campo('hola mundo', 0, 4);

    componente.aplicarFormato('nuevo', ta, 'negrita');
    expect(componente.nuevoComentario).toBe('**hola** mundo');
    expect(componente.formatoActivo('nuevo', ta, 'negrita')).toBeTrue();
    expect(componente.formatoActivo('nuevo', ta, 'cursiva')).toBeFalse();

    componente.aplicarFormato('nuevo', ta, 'negrita');
    expect(componente.nuevoComentario).toBe('hola mundo');
    ta.remove();
  });

  it('subrayado y código escriben las etiquetas de html-basico; también se quitan con la marca elegida', () => {
    const ta = campo('ver x', 4, 5);
    componente.aplicarFormato('nuevo', ta, 'codigo');
    expect(componente.nuevoComentario).toBe('ver <code>x</code>');

    ta.setSelectionRange(4, componente.nuevoComentario.length);
    componente.aplicarFormato('nuevo', ta, 'codigo');
    expect(componente.nuevoComentario).toBe('ver x');

    ta.setSelectionRange(0, 3);
    componente.aplicarFormato('nuevo', ta, 'subrayado');
    expect(componente.formatear(componente.nuevoComentario)).toContain('<u>ver</u>');
    ta.remove();
  });

  it('cita antepone "> " a las líneas elegidas, se quita con otro clic y formatear la muestra como bloque', () => {
    const ta = campo('uno\ndos\ntres', 1, 5);

    componente.alternarCita('nuevo', ta);
    expect(componente.nuevoComentario).toBe('> uno\n> dos\ntres');
    expect(componente.formatear(componente.nuevoComentario)).toBe('<blockquote>uno<br>dos</blockquote>tres');

    componente.alternarCita('nuevo', ta);
    expect(componente.nuevoComentario).toBe('uno\ndos\ntres');
    ta.remove();
  });

  it('mencionar escribe "@" separado de la palabra anterior', () => {
    const ta = campo('hola', 4);
    componente.insertarMencion('nuevo', ta);
    expect(componente.nuevoComentario).toBe('hola @');
    ta.remove();
  });
});
