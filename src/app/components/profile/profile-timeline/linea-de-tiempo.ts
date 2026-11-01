import { ActividadMuro, MuroPerfilItem } from 'src/app/models/perfil/perfil-muro.model';

/** Lo que se dibuja en la línea de tiempo: separadores de día, entradas y tandas de reacciones plegadas. */
export type Bloque =
  | { tipo: 'dia'; clave: string; etiqueta: string; fecha: string }
  | { tipo: 'item'; clave: string; item: MuroPerfilItem }
  | { tipo: 'grupo'; clave: string; ocultos: number };

/** Desde cuántas reacciones seguidas (mismo día) se pliegan; quedan a la vista las primeras VISIBLES_EN_TANDA. */
export const TANDA_MINIMA = 4;
export const VISIBLES_EN_TANDA = 2;

const DIA_MS = 86_400_000;

function inicioDelDia(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** "Hoy", "Ayer", el día de la semana si fue esta semana, o "9 oct" (con año si no es el actual). */
export function etiquetaDia(fecha: string | Date, ahora = new Date()): string {
  const d = new Date(fecha);
  const dias = Math.round((inicioDelDia(ahora) - inicioDelDia(d)) / DIA_MS);
  if (dias <= 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  if (dias < 7) {
    const dia = d.toLocaleDateString('es', { weekday: 'long' });
    return dia.charAt(0).toUpperCase() + dia.slice(1);
  }
  const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  if (d.getFullYear() !== ahora.getFullYear()) opciones.year = 'numeric';
  return d.toLocaleDateString('es', opciones).replace('.', '');
}

/** Reacción menor (me gusta, puntos, seguir...): se puede plegar en tandas. Los comentarios y lo creado, no. */
export function esMenor(item: MuroPerfilItem): boolean {
  const a = item.actividad;
  return item.tipo === 'actividad' && !!a && a.tipo !== 'comentario' && !a.extracto && ![1, 9, 14, 16, 18].includes(a.tipoActividad);
}

/**
 * Agrupa por día y pliega las tandas largas de reacciones (si no, diez "me gusta" seguidos tapan lo demás).
 * Una tanda se identifica por la clave de su primera entrada: `abiertas` son las que el usuario desplegó.
 */
export function armarBloques(items: MuroPerfilItem[], abiertas: ReadonlySet<string>, ahora = new Date()): Bloque[] {
  const bloques: Bloque[] = [];
  let diaActual = '';
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    const dia = etiquetaDia(item.fecha, ahora);
    if (dia !== diaActual) {
      diaActual = dia;
      bloques.push({ tipo: 'dia', clave: `dia-${item.clave}`, etiqueta: dia, fecha: item.fecha });
    }

    if (!esMenor(item)) {
      bloques.push({ tipo: 'item', clave: item.clave, item });
      i++;
      continue;
    }

    let fin = i;
    while (fin < items.length && esMenor(items[fin]) && etiquetaDia(items[fin].fecha, ahora) === dia) fin++;
    const tanda = items.slice(i, fin);
    const plegar = tanda.length >= TANDA_MINIMA && !abiertas.has(tanda[0].clave);
    for (const t of plegar ? tanda.slice(0, VISIBLES_EN_TANDA) : tanda) bloques.push({ tipo: 'item', clave: t.clave, item: t });
    if (plegar) bloques.push({ tipo: 'grupo', clave: tanda[0].clave, ocultos: tanda.length - VISIBLES_EN_TANDA });
    i = fin;
  }
  return bloques;
}

/** Ícono y color del punto de cada actividad (valores de TipoActividad del API). */
export function iconoActividad(a: ActividadMuro): { icono: string; tono: string } {
  if (a.tipo === 'comentario') return { icono: 'ti-message-circle', tono: 'comentario' };
  switch (a.tipoActividad) {
    case 2: return { icono: 'ti-star', tono: 'reaccion' };
    case 3: return { icono: 'ti-coin', tono: 'reaccion' };
    case 4: return { icono: 'ti-thumb-up', tono: 'reaccion' };
    case 6: return { icono: 'ti-arrow-big-up', tono: 'reaccion' };
    case 7: return { icono: 'ti-bookmark', tono: 'reaccion' };
    case 8: return { icono: 'ti-user-plus', tono: 'gente' };
    case 9: return { icono: 'ti-photo', tono: 'post' };
    case 11: return { icono: 'ti-heart', tono: 'reaccion' };
    case 12: return { icono: 'ti-message-circle', tono: 'comentario' };
    case 14: return { icono: 'ti-users-group', tono: 'comunidad' };
    case 15: return { icono: 'ti-users-plus', tono: 'comunidad' };
    case 16: return { icono: 'ti-message-plus', tono: 'comunidad' };
    case 17: return { icono: 'ti-messages', tono: 'comunidad' };
    case 18: return { icono: 'ti-award', tono: 'rango' };
    default: return { icono: 'ti-activity', tono: 'gente' };
  }
}
