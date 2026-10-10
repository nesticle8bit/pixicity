import { Injectable } from '@angular/core';

/**
 * Estado del render en el servidor (SSR para bots). Si una llamada al API falló por infraestructura (API caído,
 * 5xx, host rechazado) la página NO debe responder 404 "no encontrado": Google desindexaría contenido que existe.
 * En ese caso se responde 503 y nginx le sirve al bot la app normal (respaldo @spa_fallback).
 */
@Injectable({ providedIn: 'root' })
export class SsrSalud {
  apiFallo = false;
}
