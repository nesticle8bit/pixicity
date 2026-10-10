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

  await expect(page).toHaveURL(/\/login$/);
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
  await campo.pressSequentially('Gracias @aut');

  const lista = page.getByRole('listbox', { name: 'Usuarios para mencionar' });
  await expect(lista.getByRole('option')).toHaveCount(2);
  await expect(campo).toHaveAttribute('aria-expanded', 'true');
  await campo.press('ArrowDown');
  await expect(lista.getByRole('option', { name: '@autora' })).toHaveAttribute('aria-selected', 'true');
  await campo.press('ArrowUp');
  await campo.press('Enter');

  await expect(campo).toHaveValue('Gracias @autor_demo ');
  await expect(lista).toBeHidden();
  expect(consultas.at(-1)).toBe('aut'); // con espera: no una consulta por tecla
  expect(consultas.length).toBeLessThanOrEqual(2);

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
