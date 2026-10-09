import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Qué rutas se renderizan en el servidor. El SSR existe para los bots (Google, redes sociales): nginx les manda
 * a ellos al servidor Node y al resto de la gente la app normal. El contenido es dinámico, así que nada se
 * prerenderiza en el build: se renderiza en cada petición.
 *
 * Las zonas privadas o sin interés para buscadores (bloqueadas en robots.txt) se sirven como app de cliente.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'administracion/**', renderMode: RenderMode.Client },
  { path: 'cuenta', renderMode: RenderMode.Client },
  { path: 'mensajes/**', renderMode: RenderMode.Client },
  { path: 'crear/**', renderMode: RenderMode.Client },
  { path: 'posts/actualizar/:id', renderMode: RenderMode.Client },
  { path: 'favoritos', renderMode: RenderMode.Client },
  { path: 'borradores', renderMode: RenderMode.Client },
  { path: 'monitor', renderMode: RenderMode.Client },
  { path: 'mi', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
