import { Pipe, PipeTransform } from '@angular/core';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

/**
 * Fecha corta para listas en el celular, como en X: "ahora", "5 min", "2 h", "3 d"; desde la semana, "9 oct"
 * (y el año si no es el actual). La fecha completa queda en el tooltip y en el atributo datetime.
 */
export function tiempoCorto(valor: Date | string | number | null | undefined, ahora = Date.now()): string {
  if (valor === null || valor === undefined || valor === '') return '';
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) return '';

  const segundos = Math.max(0, Math.round((ahora - fecha.getTime()) / 1000));
  if (segundos < 60) return 'ahora';
  if (segundos < 3600) return `${Math.floor(segundos / 60)} min`;
  if (segundos < 86400) return `${Math.floor(segundos / 3600)} h`;
  if (segundos < 7 * 86400) return `${Math.floor(segundos / 86400)} d`;

  const corta = `${fecha.getDate()} ${MESES[fecha.getMonth()]}`;
  return fecha.getFullYear() === new Date(ahora).getFullYear() ? corta : `${corta} ${fecha.getFullYear()}`;
}

@Pipe({ name: 'tiempoCorto', pure: true })
export class TiempoCortoPipe implements PipeTransform {
  transform(valor: Date | string | number | null | undefined): string {
    return tiempoCorto(valor);
  }
}
