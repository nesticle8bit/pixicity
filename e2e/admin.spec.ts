import { expect, Page, test } from '@playwright/test';
import { simularApi } from './api-simulada';

/** Panel de administración con el API simulado: usuarios (correo sin confirmar) y moderación (shouts denunciados). */

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const JWT = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ exp: 4102444800, unique_name: 'admin', role: 'Administrador' })}.firma`;
const SESION = { usuario: { id: 'MQ==', userName: 'admin', rango: 'Administrador', avatar: '' }, token: `Bearer ${JWT}`, refreshToken: 'r' };
const ok = (data: unknown) => ({ json: { status: 200, errors: [], data } });
const pagina = (lista: unknown[], clave = 'data') => ({ [clave]: lista, pagination: { totalCount: lista.length, pageSize: 25, currentPage: 1, totalPages: 1 } });

async function comoAdmin(page: Page): Promise<void> {
  await simularApi(page);
  await page.addInitScript((s) => localStorage.setItem('taringas', s), JSON.stringify(SESION));
}

test('usuarios: filtra por correo sin confirmar y lo confirma a mano', async ({ page }) => {
  await comoAdmin(page);
  const pedidosLista: URL[] = [];
  await page.route(/\/api\/usuarios\/getUsuariosAdmin/i, (r) => {
    pedidosLista.push(new URL(r.request().url()));
    return r.fulfill(ok(pagina([
      { id: 7, fechaRegistro: '2026-10-10T10:00:00Z', userName: 'nuevo', email: 'nuevo@correo.com', emailConfirmado: false, genero: null,
        puntos: 0, baneado: false, eliminado: false, avatar: null, cantidadPosts: 0, cantidadComentarios: 0, estado: null },
    ], 'usuarios')));
  });
  let confirmado = '';
  await page.route(/\/api\/usuarios\/confirmarEmailAdmin/i, (r) => {
    confirmado = new URL(r.request().url()).searchParams.get('usuarioId') ?? '';
    return r.fulfill(ok(true));
  });
  page.on('dialog', (d) => d.accept());

  await page.goto('/administracion/usuarios');
  const fila = page.getByRole('row', { name: /nuevo@correo\.com/ });
  await expect(fila.getByText('Sin confirmar')).toBeVisible();

  await fila.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('menuitem', { name: 'Marcar correo como confirmado' }).click();
  await expect.poll(() => confirmado).toBe('7');
  await expect(fila.getByText('Sin confirmar')).toBeHidden();
});

test('moderación: un shout denunciado se muestra con su tipo y enlace, y se puede eliminar', async ({ page }) => {
  await comoAdmin(page);
  await page.route(/\/api\/moderacion\/getReportes/i, (r) => r.fulfill(ok(pagina([
    { id: 3, tipoContenido: 6, tipoContenidoNombre: 'Shout', contenidoId: 44, motivo: 'Spam o publicidad', resuelto: false,
      resueltoPor: null, fechaResuelto: null, fechaRegistro: '2026-10-11T10:00:00Z', reportanteUserName: 'ana', reportanteAvatar: null,
      contenidoPreview: 'Compra seguidores baratos', autorUserName: 'spammer', autorAvatar: null, contenidoEliminado: false,
      contextoUrl: 'spammer' },
  ]))));
  let eliminado = '';
  await page.route(/\/api\/moderacion\/eliminarContenidoReportado/i, (r) => {
    eliminado = new URL(r.request().url()).searchParams.get('reporteId') ?? '';
    return r.fulfill(ok(true));
  });
  page.on('dialog', (d) => d.accept());

  await page.goto('/administracion/moderacion');
  const fila = page.getByRole('row', { name: /Compra seguidores baratos/ });
  await expect(fila.getByText('Shouts', { exact: true })).toBeVisible();
  await expect(fila.getByRole('link', { name: 'ver shout' })).toHaveAttribute('href', '/shouts/spammer/44');

  await fila.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('menuitem', { name: /Borrar contenido/ }).click();
  await expect.poll(() => eliminado).toBe('3');
});
