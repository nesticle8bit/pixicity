import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';
import { AUTOR, FOTO, POST, simularApi } from './api-simulada';

/**
 * Flujos de usuario con el API simulado: registro, votar fotos, denunciar comentarios, shouts, mensajes y cuenta.
 * Como en flujos-criticos, se verifica lo que la app le manda al API además de lo que muestra.
 */

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (userName: string) => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ exp: 4102444800, unique_name: userName, role: 'Usuario' })}.firma`;
const ok = (data: unknown) => ({ json: { status: 200, errors: [], data } });

async function conSesion(page: Page, userName = 'lector_tres', avatar = ''): Promise<void> {
  const sesion = { usuario: { id: 'MQ==', userName, rango: 'Usuario', avatar }, token: `Bearer ${jwt(userName)}`, refreshToken: 'r' };
  await page.addInitScript((s) => localStorage.setItem('taringas', s), JSON.stringify(sesion));
}

/** Elige una opción de un app-select (combo con búsqueda) por su texto. */
async function elegir(page: Page, combo: ReturnType<Page['locator']>, opcion: string): Promise<void> {
  await combo.click();
  await page.locator('.asel__option', { hasText: opcion }).click();
}

test.beforeEach(async ({ page }) => {
  await simularApi(page);
});

test('registro: exige aceptar los términos y envía los datos', async ({ page }) => {
  await page.route('**/api/configuracion/getConfiguracion', (r) => r.fulfill(ok({ disableUserRegistration: false })));
  await page.route('**/api/paises/getPaisesDropdown', (r) => r.fulfill(ok([{ id: 1, nombre: 'Argentina', iso2: 'AR' }, { id: 2, nombre: 'Chile', iso2: 'CL' }])));
  await page.route('**/api/paises/getEstadosByPais**', (r) => r.fulfill(ok([{ id: 10, nombre: 'Córdoba' }])));
  let enviado: Record<string, unknown> | undefined;
  await page.route('**/api/usuarios/registrarUsuario', (r) => {
    enviado = r.request().postDataJSON();
    return r.fulfill(ok(99));
  });

  await page.goto('/registro');
  await page.locator('#register-userName').fill('nuevo_usuario');
  await page.locator('#password').fill('Secreta123!');
  await page.locator('#register-email').fill('nuevo@ejemplo.com');
  const combos = page.locator('app-select .asel');
  await elegir(page, combos.nth(0), 'Chile');
  await elegir(page, combos.nth(1), 'Córdoba');

  const registrarse = page.getByRole('button', { name: 'Registrarse' });
  await expect(registrarse).toBeDisabled(); // falta aceptar los términos
  await page.getByText('Acepto los Términos y Condiciones de uso').click();
  await expect(registrarse).toBeEnabled();
  await registrarse.click();

  // Al entrar por primera vez sigue la bienvenida guiada.
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fbienvenida$/);
  expect(enviado).toEqual(expect.objectContaining({
    userName: 'nuevo_usuario', email: 'nuevo@ejemplo.com', paisId: 2, estadoId: 10, termsConditions: true,
  }));
});

test('fotos: votar positivo y después negativo actualiza ambos contadores', async ({ page }) => {
  await conSesion(page);
  const votos: number[] = [];
  await page.route('**/api/fotos/VotarFoto**', (r) => {
    const cantidad = Number(r.request().postDataJSON()?.cantidad);
    votos.push(cantidad);
    return r.fulfill(ok(cantidad === 1
      ? { id: FOTO.id, votosPositivos: 4, votosNegativos: 0, miVoto: 1 }
      : { id: FOTO.id, votosPositivos: 3, votosNegativos: 1, miVoto: -1 }));
  });

  await page.goto(`/fotos/${AUTOR}/${FOTO.id}/${FOTO.url}`);
  await page.getByRole('button', { name: 'Votar positivo' }).click();
  await expect(page.getByText('4 positivos')).toBeVisible();
  await page.getByRole('button', { name: 'Votar negativo' }).click();
  await expect(page.getByText('1 negativos')).toBeVisible();
  await expect(page.getByText('3 positivos')).toBeVisible();
  expect(votos).toEqual([1, -1]);
});

test('denunciar un comentario: elige el motivo en un diálogo y lo envía', async ({ page }) => {
  await conSesion(page);
  let denuncia: Record<string, unknown> | undefined;
  await page.route('**/api/comentarios/denunciarComentario**', (r) => {
    denuncia = r.request().postDataJSON();
    return r.fulfill(ok(true));
  });

  await page.goto(`/posts/${POST.categoria.seo}/${POST.id}/${POST.url}`);
  await page.locator('#comentario-3').getByRole('button', { name: 'Denunciar' }).click();

  const dialogo = page.getByRole('dialog', { name: 'Denunciar comentario' });
  await expect(dialogo).toBeVisible();
  const enviar = dialogo.getByRole('button', { name: 'Denunciar' });
  await expect(enviar).toBeDisabled();
  await dialogo.getByLabel('Otro').check();
  await expect(enviar).toBeDisabled(); // "Otro" exige escribir el motivo
  await dialogo.getByRole('textbox').fill('Publica enlaces engañosos');
  await enviar.click();

  await expect(dialogo).toBeHidden();
  await expect.poll(() => denuncia).toEqual(expect.objectContaining({ motivo: 'Publica enlaces engañosos' }));
});

test('shouts: publicar en el muro del perfil envía el texto y recarga el muro', async ({ page }) => {
  await conSesion(page);
  await page.route('**/api/usuarios/getUserByUserName**', (r) =>
    r.fulfill(ok({ id: 5, userName: AUTOR, avatar: null, profileBackground: '', rango: null, pais: null, postsCount: 2, seguidoresCount: 7 })));
  let cargasDelMuro = 0;
  await page.route('**/api/shouts/getShouts**', (r) => {
    cargasDelMuro++;
    return r.fulfill(ok({ shouts: [], pagination: { totalCount: 0, pageSize: 10, currentPage: 1, totalPages: 0 } }));
  });
  let shout: Record<string, unknown> | undefined;
  await page.route('**/api/shouts/createShout', (r) => {
    shout = r.request().postDataJSON();
    return r.fulfill(ok({ id: 50, comentario: shout?.['comentario'] }));
  });

  await page.goto(`/perfil/${AUTOR}`);
  const texto = page.getByLabel('¿Qué estás pensando?');
  await expect(texto).toBeVisible();
  await expect.poll(() => cargasDelMuro).toBe(1);

  const compartir = page.getByRole('button', { name: 'Compartir' });
  await expect(compartir).toBeDisabled();
  await texto.fill('¡Hola muro!');
  await page.getByRole('button', { name: 'Agregar emoji' }).click();
  await page.getByRole('dialog', { name: 'Elegir emoji' }).getByRole('button', { name: '😀' }).click();
  await page.keyboard.press('Escape');
  await expect(texto).toHaveValue('¡Hola muro!😀');
  await compartir.click();

  await expect.poll(() => shout).toEqual(expect.objectContaining({ comentario: '¡Hola muro!😀', perfilId: 5 }));
  await expect(texto).toHaveValue('');
  await expect.poll(() => cargasDelMuro).toBe(2);
});

test('mensajes: Enter envía, Shift+Enter hace salto de línea y el mensaje aparece en la conversación', async ({ page }) => {
  await conSesion(page);
  const otro = { id: 5, userName: AUTOR, avatar: null };
  const yo = { id: 1, userName: 'lector_tres', avatar: null };
  const msg = (id: number, de: typeof otro, contenido: string) => ({
    id, fechaRegistro: new Date().toISOString(), asunto: '', contenido, leido: true, eliminado: false,
    esMio: de === yo, usuarioDe: de, usuarioA: de === yo ? otro : yo,
  });
  const mensajes = [msg(1, otro, '¿Viste mi último post?')];
  await page.route('**/api/mensajes/getConversacion**', (r) => r.fulfill(ok({ mensajes, hayMas: false, bloqueado: false, otro })));
  let enviado: Record<string, unknown> | undefined;
  await page.route('**/api/mensajes/sendMensajePrivado', (r) => {
    enviado = r.request().postDataJSON();
    mensajes.push(msg(2, yo, String(enviado?.['contenido'])));
    return r.fulfill(ok({ type: 'id', message: '2' }));
  });

  await page.goto(`/mensajes/chat/${AUTOR}`);
  await expect(page.getByText('¿Viste mi último post?')).toBeVisible();

  const campo = page.getByLabel('Escribir un mensaje');
  await campo.click();
  await campo.pressSequentially('Sí, muy bueno');
  await campo.press('Shift+Enter');
  await campo.pressSequentially('Gracias');
  await campo.press('Enter');

  await expect.poll(() => enviado).toEqual(expect.objectContaining({ aUserName: AUTOR, contenido: 'Sí, muy bueno<br>Gracias' }));
  await expect(campo).toHaveValue('');
  await expect(page.getByText('Gracias')).toBeVisible();
});

test('cuenta: cambiar de país obliga a elegir un estado de ese país y guarda los datos', async ({ page }) => {
  await conSesion(page);
  await page.route('**/api/usuarios/getLoggedUserByJwt', (r) => r.fulfill(ok({
    userName: 'lector_tres', email: 'lector@ejemplo.com', avatar: null, genero: 'Masculino', paisId: 1, estadoId: 10, fechaNacimiento: '5/3/1990',
  })));
  await page.route('**/api/usuarios/getCurrentPerfilInfo', (r) => r.fulfill(ok({ perfil: null, background: '' })));
  await page.route('**/api/paises/getPaisesDropdown', (r) => r.fulfill(ok([{ id: 1, nombre: 'Argentina', iso2: 'AR' }, { id: 2, nombre: 'Chile', iso2: 'CL' }])));
  await page.route('**/api/paises/getEstadosByPais**', (r) => {
    const chile = new URL(r.request().url()).searchParams.get('idPais') === '2';
    return r.fulfill(ok(chile ? [{ id: 20, nombre: 'Santiago' }] : [{ id: 10, nombre: 'Córdoba' }]));
  });
  let guardado: Record<string, unknown> | undefined;
  await page.route('**/api/usuarios/updateUsuario', (r) => {
    guardado = r.request().postDataJSON();
    return r.fulfill(ok(true));
  });

  await page.goto('/cuenta');
  const formulario = page.locator('form').filter({ has: page.locator('#account-email') });
  const combos = formulario.locator('app-select .asel');
  await expect(combos.nth(1)).toContainText('Córdoba');

  await elegir(page, combos.nth(0), 'Chile');
  await expect(combos.nth(1)).not.toContainText('Córdoba'); // el estado del país anterior se vacía
  await elegir(page, combos.nth(1), 'Santiago');
  await formulario.getByRole('button', { name: /Guardar/ }).click();

  await expect.poll(() => guardado).toEqual(expect.objectContaining({ paisId: 2, estadoId: 20, fechaNacimiento: '5/3/1990' }));
});

test('comentarios: @menciones sugiere usuarios y Enter completa el nombre', async ({ page }) => {
  await conSesion(page);
  const consultas: string[] = [];
  await page.route('**/api/usuarios/sugerirMenciones**', (r) => {
    consultas.push(new URL(r.request().url()).searchParams.get('q') ?? '');
    return r.fulfill(ok([{ id: 5, userName: 'autor_demo', avatar: null }, { id: 6, userName: 'autora', avatar: null }]));
  });

  await page.goto(`/posts/${POST.categoria.seo}/${POST.id}/${POST.url}`);
  const campo = page.getByLabel('Escribe un comentario');
  await campo.click();
  // De una vez: tecla por tecla, con la máquina cargada, las teclas se separaban más que la espera (200 ms) y salían
  // consultas de más. Que no se consulte en cada tecla lo prueba menciones.directive.spec con tiempo simulado.
  await campo.fill('Gracias @aut');

  const lista = page.getByRole('listbox', { name: 'Usuarios para mencionar' });
  await expect(lista.getByRole('option')).toHaveCount(2);
  await expect(campo).toHaveAttribute('aria-expanded', 'true');
  await campo.press('ArrowDown');
  await expect(lista.getByRole('option', { name: '@autora' })).toHaveAttribute('aria-selected', 'true');
  await campo.press('ArrowUp');
  await campo.press('Enter');

  await expect(campo).toHaveValue('Gracias @autor_demo ');
  await expect(lista).toBeHidden();
  expect(consultas).toEqual(['aut']); // con espera: una sola consulta, no una por tecla

  // El texto completado llega al modelo: el botón Comentar se habilita y envía ese texto.
  await expect(page.getByRole('button', { name: 'Comentar' })).toBeEnabled();
});

test('comentarios: la vista previa muestra enlaces y menciones como quedarán publicados', async ({ page }) => {
  await conSesion(page);
  await page.goto(`/posts/${POST.categoria.seo}/${POST.id}/${POST.url}`);

  await page.getByLabel('Escribe un comentario').fill('Mira https://ejemplo.com @autor_demo <b>no es html</b>');
  await page.getByRole('button', { name: 'Vista previa' }).click();

  const vista = page.locator('.coment-preview');
  await expect(vista.getByRole('link', { name: 'https://ejemplo.com' })).toHaveAttribute('href', 'https://ejemplo.com');
  await expect(vista.getByRole('link', { name: '@autor_demo' })).toHaveAttribute('href', '/perfil/autor_demo');
  await expect(vista).toContainText('<b>no es html</b>'); // se escapa, igual que al publicar
});

test('comentarios: el formulario muestra mi avatar y las respuestas también tienen emojis', async ({ page }) => {
  await conSesion(page, 'lector_tres', 'mi-foto.jpg');
  await page.goto(`/posts/${POST.categoria.seo}/${POST.id}/${POST.url}`);

  await expect(page.locator('.coment-form__avatar img')).toHaveAttribute('src', /avatars\/lector_tres\/mi-foto\.jpg/);

  await page.locator('#comentario-3').getByRole('button', { name: 'Responder' }).click();
  const respuesta = page.getByLabel('Escribe una respuesta');
  await respuesta.fill('Coincido totalmente');
  await respuesta.evaluate((el: HTMLTextAreaElement) => el.setSelectionRange(8, 8)); // después de "Coincido"

  await page.getByRole('button', { name: 'Agregar emoji a la respuesta' }).click();
  const selector = page.getByRole('dialog', { name: 'Elegir emoji' });
  await selector.getByRole('tab', { name: 'Gestos' }).click();
  await selector.getByRole('button', { name: '👍' }).click();
  await expect(respuesta).toHaveValue('Coincido👍 totalmente');
  await page.keyboard.press('Escape');
  await expect(selector).toBeHidden();
  await expect(page.getByRole('button', { name: 'Responder', exact: true }).last()).toBeEnabled();
});

test('shouts: me gusta y favorito se alternan y el botón de comentarios lleva al campo', async ({ page }) => {
  await conSesion(page);
  await page.route(/\/api\/shouts\/getShoutById/i, (r) =>
    r.fulfill(ok({ id: 9, comentario: 'Shout de prueba', tipo: 'Texto', url: '', fechaRegistro: '2026-10-01T12:00:00Z', avatar: { userName: AUTOR } })));
  await page.route(/\/api\/shouts\/getShoutInteracciones/i, (r) => r.fulfill(ok({ meGustas: 2, favoritos: 0, meGusta: false, favorito: false })));
  await page.route(/\/api\/shouts\/getComentariosByShoutId/i, (r) => r.fulfill(ok([])));
  const pedidos: string[] = [];
  await page.route(/\/api\/shouts\/alternar(MeGusta|Favorito)/i, (r) => {
    const tipo = /megusta/i.test(r.request().url()) ? 'meGusta' : 'favorito';
    pedidos.push(tipo);
    return r.fulfill(ok(tipo === 'meGusta' ? { total: 3, activo: true } : { total: 1, activo: true }));
  });

  await page.goto(`/shouts/${AUTOR}/9`);
  const meGusta = page.getByRole('button', { name: 'Me gusta (2)' });
  await expect(meGusta).toHaveAttribute('aria-pressed', 'false');
  await meGusta.click();
  await expect(page.getByRole('button', { name: 'Me gusta (3)' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Favorito (0)' }).click();
  await expect(page.getByRole('button', { name: 'Favorito (1)' })).toHaveAttribute('aria-pressed', 'true');
  expect(pedidos).toEqual(['meGusta', 'favorito']);

  await page.getByRole('button', { name: /^Comentar/ }).click();
  await expect(page.getByLabel('Escribe un comentario')).toBeFocused();
});

test('favoritos: busca, filtra por categoría, quita con deshacer y lista los shouts guardados', async ({ page }) => {
  await conSesion(page);
  const fila = (id: number, titulo: string, categoria: { id: number; nombre: string; icono: string; seo: string }) => ({
    id, fechaRegistro: '2026-10-09T12:00:00Z', postId: 100 + id, titulo, url: titulo.toLowerCase().replace(/ /g, '-'),
    postFechaRegistro: '2026-09-01T12:00:00Z', puntos: 12, comentarios: 4, autor: AUTOR, categoria,
  });
  const linux = { id: 1, nombre: 'Linux', icono: 'linux.png', seo: 'linux' };
  const juegos = { id: 2, nombre: 'Juegos', icono: 'juegos.png', seo: 'juegos' };
  const consultas: URLSearchParams[] = [];
  await page.route(/\/api\/favoritos\/getFavoritos/i, (r) => {
    const q = new URL(r.request().url()).searchParams;
    consultas.push(q);
    const todos = [fila(1, 'Instalar Arch paso a paso', linux), fila(2, 'Mejores juegos del año', juegos)];
    const lista = todos.filter((f) => (q.get('categoriaId') === '0' || String(f.categoria.id) === q.get('categoriaId'))
      && f.titulo.toLowerCase().includes((q.get('query') ?? '').toLowerCase()));
    return r.fulfill(ok({
      favoritos: lista,
      categorias: [{ categoria: linux, count: 1 }, { categoria: juegos, count: 1 }],
      pagination: { totalCount: lista.length, pageSize: 10, currentPage: 1, totalPages: 1 },
    }));
  });
  const quitados: string[] = [];
  await page.route(/\/api\/favoritos\/deleteFavorito/i, (r) => {
    const id = new URL(r.request().url()).searchParams.get('favoritoId')!;
    const eliminado = !quitados.includes(id);
    eliminado ? quitados.push(id) : quitados.splice(quitados.indexOf(id), 1);
    return r.fulfill(ok({ favoritoId: +id, eliminado }));
  });
  await page.route(/\/api\/shouts\/getShoutsFavoritos/i, (r) => r.fulfill(ok({
    shouts: [{ id: 9, comentario: 'Un shout guardado', tipo: 'Texto', fechaRegistro: '2026-10-01T12:00:00Z', avatar: { userName: AUTOR, avatar: null } }],
    pagination: { totalCount: 1, pageSize: 10, currentPage: 1, totalPages: 1 },
  })));

  await page.goto('/favoritos');
  await expect(page.getByRole('link', { name: 'Instalar Arch paso a paso' })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Posts/ })).toHaveAttribute('aria-selected', 'true');

  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).options({ iframes: false }).include('.fav').analyze();
  expect(axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ') + ' ' + n.failureSummary).join(' | ')}`)).toEqual([]);

  await page.getByRole('button', { name: /^Juegos/ }).click();
  await expect(page.getByRole('link', { name: 'Instalar Arch paso a paso' })).toBeHidden();
  await expect(page.getByRole('button', { name: /^Juegos/ })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: /^Todas/ }).click();
  await page.getByLabel('Buscar en mis favoritos').fill('arch');
  await expect(page.getByRole('link', { name: 'Mejores juegos del año' })).toBeHidden();
  expect(consultas.at(-1)?.get('query')).toBe('arch'); // con espera: no una consulta por tecla
  expect(consultas.filter((q) => q.get('query')).length).toBe(1);

  await page.getByRole('button', { name: 'Quitar de favoritos: Instalar Arch paso a paso' }).click();
  const deshacer = page.getByRole('button', { name: 'Deshacer' });
  await expect(deshacer).toBeVisible();
  expect(quitados).toEqual(['1']);
  await deshacer.click();
  await expect(page.getByRole('button', { name: 'Quitar de favoritos: Instalar Arch paso a paso' })).toBeVisible();
  expect(quitados).toEqual([]);

  await page.getByRole('tab', { name: /Shouts/ }).click();
  await expect(page).toHaveURL(/\?tipo=shouts/);
  await expect(page.getByRole('link', { name: 'Un shout guardado' })).toHaveAttribute('href', `/shouts/${AUTOR}/9`);
});

/** Muro simulado de /mi: página 1 con un reshout, un post y un shout; página 2 con un shout propio. */
async function simularMi(page: Page) {
  const shout = (id: number, autor: string, texto: string, extra: object = {}) => ({
    id, comentario: texto, tipo: 'Texto', url: '', fechaRegistro: '2026-10-09T12:00:00Z',
    avatar: { userName: autor, avatar: null }, perfil: { userName: autor, avatar: null },
    interacciones: { meGustas: 1, favoritos: 0, comentarios: 3, reshouts: 2, meGusta: false, favorito: false, reshouteado: false },
    ...extra,
  });
  const pedidos: { url: URL; metodo: string }[] = [];
  await page.route(/\/api\/mi\/getMuro/i, (r) => {
    const url = new URL(r.request().url());
    pedidos.push({ url, metodo: 'GET' });
    if (url.searchParams.get('antes')) {
      return r.fulfill(ok({ items: [{ tipo: 'shout', fecha: '2026-10-01T10:00:00Z', shout: shout(4, 'lector_tres', 'Mi primer shout'), compartidoPor: null, post: null }], siguiente: null }));
    }
    return r.fulfill(ok({
      items: [
        { tipo: 'reshout', fecha: '2026-10-10T10:00:00Z', shout: shout(1, 'ajeno', 'Shout compartido'), compartidoPor: { userName: AUTOR, avatar: null }, post: null },
        { tipo: 'post', fecha: '2026-10-09T10:00:00Z', shout: null, compartidoPor: null,
          post: { id: 77, titulo: 'Post de alguien que sigo', url: 'post-de-alguien-que-sigo', puntos: 5, comentarios: 2, autor: { userName: AUTOR, avatar: null },
            categoriaNombre: 'Linux', categoriaIcono: 'linux.png', categoriaSeo: 'linux' } },
        { tipo: 'shout', fecha: '2026-10-08T10:00:00Z', shout: shout(2, AUTOR, 'Hola desde el muro'), compartidoPor: null, post: null },
      ],
      siguiente: '2026-10-08T10:00:00Z',
    }));
  });
  await page.route(/\/api\/mi\/getResumen/i, (r) => r.fulfill(ok({ id: 1, userName: 'lector_tres', avatar: null, rango: 'Novato', puntos: 120, seguidores: 4, siguiendo: 1, shouts: 1, posts: 0 })));
  await page.route(/\/api\/mi\/getSugerencias/i, (r) => r.fulfill(ok([{ userName: 'popular', avatar: null, seguidores: 30 }])));
  return pedidos;
}

test('mi: muestra el muro mezclado, carga más, comparte y sigue a una sugerencia', async ({ page }) => {
  await conSesion(page);
  const pedidos = await simularMi(page);
  const acciones: string[] = [];
  await page.route(/\/api\/shouts\/alternarReshout/i, (r) => (acciones.push('reshout'), r.fulfill(ok({ total: 3, activo: true }))));
  await page.route(/\/api\/usuarios\/seguirUsuario/i, (r) => (acciones.push('seguir:' + r.request().postDataJSON().userName), r.fulfill(ok(1))));

  await page.goto('/mi');
  await expect(page.getByText('compartió')).toBeVisible();
  await expect(page.getByRole('link', { name: /Post de alguien que sigo/ })).toHaveAttribute('href', '/posts/linux/77/post-de-alguien-que-sigo');
  await expect(page.getByText('Hola desde el muro')).toBeVisible();
  await expect(page.getByLabel('¿Qué estás pensando?')).toBeVisible();

  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).options({ iframes: false }).include('.mi').include('.mi-lateral')
    // El color del rango lo define el admin en cada rango (dato, no estilo nuestro).
    .exclude('.op-rango')
    .analyze();
  expect(axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);

  // La página siguiente se pide sola al acercarse al final de la lista.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.getByText('Mi primer shout')).toBeVisible();
  await expect(page.getByText('No hay más publicaciones.')).toBeVisible();
  expect(pedidos.at(-1)?.url.searchParams.get('antes')).toBe('2026-10-08T10:00:00Z');
  // El shout propio no se puede compartir.
  await expect(page.getByRole('button', { name: 'Compartir (2)' }).last()).toBeDisabled();

  await page.getByRole('button', { name: 'Compartir (2)' }).first().click();
  await expect(page.getByRole('button', { name: 'Compartir (3)' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Seguir a popular' }).click();
  await expect(page.getByRole('button', { name: 'Dejar de seguir a popular' })).toBeVisible();
  expect(acciones).toEqual(['reshout', 'seguir:popular']);
  // Seguir a alguien recarga el muro desde arriba.
  await expect.poll(() => pedidos.filter((p) => !p.url.searchParams.get('antes')).length).toBe(2);

  await page.getByRole('tab', { name: 'Novedades' }).click();
  await expect(page).toHaveURL(/\?ver=novedades/);
  await expect.poll(() => pedidos.at(-1)?.url.searchParams.get('alcance')).toBe('todos');
});

test('correo sin confirmar: el aviso reenvía el enlace y el enlace del correo confirma la cuenta', async ({ page }) => {
  const sesion = {
    usuario: { id: 'MQ==', userName: 'lector_tres', rango: 'Usuario', avatar: '', emailConfirmado: false },
    token: `Bearer ${jwt('lector_tres')}`,
    refreshToken: 'r',
  };
  await page.addInitScript((s) => localStorage.setItem('taringas', s), JSON.stringify(sesion));
  await page.route(/\/api\/usuarios\/getEstadoEmail/i, (r) => r.fulfill(ok({ emailConfirmado: false, email: 'lector@correo.com' })));
  let reenvios = 0;
  await page.route(/\/api\/usuarios\/reenviarConfirmacion/i, (r) => (reenvios++, r.fulfill(ok(true))));
  let tokenEnviado = '';
  await page.route(/\/api\/usuarios\/confirmarEmail/i, (r) => {
    tokenEnviado = r.request().postDataJSON().token;
    return r.fulfill(ok({ userName: 'lector_tres' }));
  });

  await page.goto('/');
  const aviso = page.getByRole('status').filter({ hasText: 'Confirma tu correo' });
  await expect(aviso).toContainText('lector@correo.com');
  await aviso.getByRole('button', { name: 'Reenviar correo' }).click();
  await expect(aviso.getByRole('button', { name: 'Enviado' })).toBeDisabled();
  expect(reenvios).toBe(1);

  await page.goto('/confirmar-email?token=abc123');
  await expect(page.getByRole('heading', { name: '¡Correo confirmado!' })).toBeVisible();
  expect(tokenEnviado).toBe('abc123');
  // La sesión queda confirmada: el aviso desaparece.
  await expect(page.getByText('Confirma tu correo para poder publicar.')).toBeHidden();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taringas')!).usuario.emailConfirmado)).toBe(true);
});

test('confirmar correo: un enlace vencido explica el motivo', async ({ page }) => {
  await page.route(/\/api\/usuarios\/confirmarEmail/i, (r) =>
    r.fulfill({ status: 400, json: { status: 400, errors: ['El enlace no es válido o ya venció. Pide uno nuevo desde tu cuenta.'], data: null } }));

  await page.goto('/confirmar-email?token=viejo');

  await expect(page.getByRole('heading', { name: 'No pudimos confirmar tu correo' })).toBeVisible();
  await expect(page.getByText('El enlace no es válido o ya venció.')).toBeVisible();
});

test('olvidé mi contraseña: pide el enlace y el enlace permite elegir una nueva', async ({ page }) => {
  let pedido: Record<string, unknown> | undefined;
  await page.route(/\/api\/usuarios\/solicitarRestablecimiento/i, (r) => ((pedido = r.request().postDataJSON()), r.fulfill(ok(true))));
  let restablecido: Record<string, unknown> | undefined;
  await page.route(/\/api\/usuarios\/restablecerPassword/i, (r) => ((restablecido = r.request().postDataJSON()), r.fulfill(ok({ userName: 'ana' }))));

  await page.goto('/login');
  await page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }).click();
  await expect(page.getByRole('heading', { name: '¿Olvidaste tu contraseña?' })).toBeVisible();
  await page.getByLabel('Correo electrónico').fill('ana@correo.com');
  await page.getByRole('button', { name: 'Enviar enlace' }).click();
  await expect(page.getByRole('heading', { name: 'Revisa tu correo' })).toBeVisible();
  expect(pedido).toEqual({ email: 'ana@correo.com' });

  await page.goto('/restablecer-password?token=tok123');
  await page.getByLabel('Contraseña nueva').fill('clave-nueva');
  await page.getByLabel('Repite la contraseña').fill('otra-cosa');
  await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Las contraseñas no coinciden.' })).toBeVisible();
  expect(restablecido).toBeUndefined();

  await page.getByLabel('Repite la contraseña').fill('clave-nueva');
  await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
  await expect(page.getByRole('heading', { name: '¡Contraseña cambiada!' })).toBeVisible();
  expect(restablecido).toEqual({ token: 'tok123', password: 'clave-nueva' });
});

test('login con verificación en dos pasos: pide el código y recién después entra', async ({ page }) => {
  await page.route(/\/api\/usuarios\/login$/i, (r) => r.fulfill(ok({ requiere2FA: true, desafio: 'des-123' })));
  const codigos: string[] = [];
  await page.route(/\/api\/usuarios\/login2FA/i, (r) => {
    const { desafio, codigo } = r.request().postDataJSON();
    codigos.push(`${desafio}:${codigo}`);
    if (codigo === '000000') return r.fulfill({ status: 400, json: { status: 400, errors: ['El código no es correcto'], data: null } });
    return r.fulfill(ok({ usuario: { id: 'MQ==', userName: 'lector_tres', rango: 'Usuario', avatar: '' }, token: `Bearer ${jwt('lector_tres')}`, refreshToken: 'r' }));
  });

  await page.goto('/login');
  await page.getByLabel('Nombre de Usuario').fill('lector_tres');
  await page.getByLabel('Contraseña').fill('clave');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  const codigo = page.getByLabel('Código de verificación');
  await expect(codigo).toBeFocused();
  await codigo.fill('000000');
  await page.getByRole('button', { name: 'Verificar' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'El código no es correcto' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('taringas'))).toBeNull();

  await codigo.fill('123456');
  await page.getByRole('button', { name: 'Verificar' }).click();
  // Al entrar la app recarga en el inicio: se espera esa navegación antes de leer la sesión guardada.
  await page.waitForURL((u) => u.pathname === '/');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('taringas') ?? '{}').usuario?.userName)).toBe('lector_tres');
  expect(codigos).toEqual(['des-123:000000', 'des-123:123456']);
});

test('editor de posts y shouts: el botón de emojis inserta en el cursor', async ({ page }) => {
  await conSesion(page);
  await page.goto('/crear/post');
  const editor = page.locator('.rich-editor__content');
  await editor.click();
  await page.keyboard.type('Hola mundo');
  await page.keyboard.press('Home');
  await page.keyboard.press('End');

  await page.getByRole('button', { name: 'Insertar emoji' }).click();
  const selector = page.getByRole('dialog', { name: 'Elegir emoji' });
  await selector.getByRole('button', { name: '😀' }).click();
  await selector.getByRole('button', { name: '😂' }).click();
  await expect(editor).toHaveText('Hola mundo😀😂');
  await page.keyboard.press('Escape');
  await expect(selector).toBeHidden();
});
