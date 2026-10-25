import { Page } from '@playwright/test';

/**
 * API simulada para las pruebas e2e. Responde con datos fijos en el formato del API ({status, errors, data})
 * a las rutas que usan las páginas de detalle; el resto se corta como si el servidor no respondiera.
 */

const AYER = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
const HACE_UNA_HORA = new Date(Date.now() - 3600 * 1000).toISOString();

const RANGO = { nombre: 'Novato', color: '#3b82f6', icono: 'novato.png' };

export const AUTOR = 'autor_demo';

/** Comentario de un post (ComentarioViewModel) con sus respuestas. */
const comentarioPost = (id: number, usuario: string, contenido: string, votos: number, respuestas: unknown[] = []) => ({
  id,
  contenido,
  fechaComentario: HACE_UNA_HORA,
  usuario,
  avatar: null,
  rango: RANGO,
  votos,
  miVoto: 0,
  votosArriba: Math.max(votos, 0),
  votosAbajo: Math.max(-votos, 0),
  fijado: false,
  denunciasPendientes: 0,
  historial: [],
  respuestas,
});

/** Comentario plano (temas y fotos) con parentId. */
const comentarioPlano = (id: number, parentId: number | null, userName: string, contenido: string, votos: number) => ({
  id,
  parentId,
  contenido,
  fechaComentario: HACE_UNA_HORA,
  fechaActualiza: null,
  votos,
  miVoto: 0,
  votosArriba: Math.max(votos, 0),
  votosAbajo: Math.max(-votos, 0),
  denunciasPendientes: 0,
  fijado: false,
  userName,
  usuario: userName,
  avatar: null,
  rango: RANGO,
});

export const POST = {
  id: 10,
  titulo: 'Guía de prueba e2e',
  url: 'guia-de-prueba-e2e',
  contenido: '<p>Contenido del post de prueba.</p>',
  etiquetas: 'prueba,e2e',
  fechaRegistro: AYER,
  fechaActualiza: null,
  visitantes: 120,
  puntos: 15,
  favoritos: 2,
  seguidores: 1,
  sticky: false,
  esPrivado: false,
  sinComentarios: false,
  cantidadComentarios: 3,
  categoria: { id: 1, nombre: 'Info', seo: 'info' },
  usuario: { id: 1, userName: AUTOR, avatar: null },
};

export const TEMA = {
  id: 7,
  titulo: 'Tema de prueba',
  contenido: '<p>Contenido del tema.</p>',
  url: 'tema-de-prueba',
  visitantes: 30,
  sticky: false,
  fechaRegistro: AYER,
  comunidadId: 3,
  votos: 4,
  miVoto: 0,
  comunidad: { nombre: 'Comunidad Demo', nombreCorto: 'demo', usuarioId: 1 },
  userName: AUTOR,
  avatar: null,
  temasUsuario: [],
  comentarios: [
    comentarioPlano(1, null, 'lector_uno', 'Primer comentario del tema', 5),
    comentarioPlano(2, 1, AUTOR, 'Respuesta del autor', 1),
    comentarioPlano(3, null, 'lector_dos', 'Otro comentario', 0),
  ],
};

export const FOTO = {
  id: 5,
  titulo: 'Foto de prueba',
  url: 'foto-de-prueba',
  descripcion: 'Descripción de la foto',
  imageUrl: '',
  categoria: 'Paisajes',
  fechaRegistro: AYER,
  visitantes: 12,
  votosPositivos: 3,
  votosNegativos: 0,
  miVoto: 0,
  totalComentarios: 2,
  usuario: AUTOR,
  avatar: null,
  usuarioPuntos: 50,
  usuarioTotalFotos: 4,
  usuarioTotalPosts: 2,
  usuarioUltimaConexion: AYER,
  otrasFotosUsuario: [],
};

// Rutas REST del API (ver RutasApiTests): ids en la ruta, sin verbos. La primera que coincide gana.
const RESPUESTAS: [RegExp, unknown][] = [
  [/\/api\/posts\/\d+(\?|$)/i, { post: POST }],
  [
    /\/api\/posts\/\d+\/interacciones(\?|$)/i,
    {
      misPuntos: 0,
      enFavoritos: false,
      yoRecomende: false,
      puntosDisponibles: null,
      puntosHoy: 9,
      votantes: [
        { userName: 'lector_uno', avatar: null, cantidad: 5, fecha: AYER },
        { userName: 'lector_dos', avatar: null, cantidad: 1, fecha: AYER },
      ],
      totalVotantes: 6,
      recomendaron: [{ userName: 'lector_uno', avatar: null, cantidad: 0, fecha: AYER }],
      totalRecomendaciones: 1,
    },
  ],
  [
    /\/api\/posts\/\d+\/comentarios(\?|$)/i,
    [
      comentarioPost(1, 'lector_uno', 'Muy buen aporte', 8, [comentarioPost(2, AUTOR, 'Gracias por leer', 2)]),
      comentarioPost(3, 'lector_dos', 'Comentario con enlace https://ejemplo.com', 0),
    ],
  ],
  [/\/api\/comunidades\/temas\/\d+(\?|$)/i, TEMA],
  [/\/api\/fotos\/\d+(\?|$)/i, FOTO],
  [
    /\/api\/fotos\/\d+\/comentarios(\?|$)/i,
    [comentarioPlano(1, null, 'lector_uno', 'Linda foto', 3), comentarioPlano(2, 1, AUTOR, '¡Gracias!', 0)],
  ],
  [
    /\/api\/usuarios\/por-nombre\/[^/?]+\/info(\?|$)/i,
    { userName: AUTOR, avatar: null, rango: RANGO, puntos: 50, postsCount: 2, seguidoresCount: 7 },
  ],
  // Lo que piden todas las páginas (layout, campana, selector de categorías). Cortadas, cada una mostraba un toast
  // de error arriba a la derecha que en el celular tapaba botones y se comía clics (p. ej. el "50%" del editor).
  [/\/api\/noticias(\?|$)/i, []],
  [/\/api\/paginas(\?|$)/i, []],
  [/\/api\/configuracion\/footer(\?|$)/i, ''],
  [/\/api\/notificaciones\/estadisticas(\?|$)/i, { notifications: 0, messages: 0 }],
  [/\/api\/categorias(\?|$)/i, []],
  [/\/api\/anuncios(\?|$)/i, []],
];

export async function simularApi(page: Page): Promise<void> {
  // Tiempo real (SignalR): se corta como servidor caído; la app lo tolera.
  await page.route('**/api/hubs/**', (route) => route.abort());
  await page.route('**/api/**', (route) => {
    const url = route.request().url();
    const encontrado = RESPUESTAS.find(([patron]) => patron.test(url));
    if (!encontrado) return route.abort();
    return route.fulfill({ json: { status: 200, errors: [], data: encontrado[1] } });
  });
}
