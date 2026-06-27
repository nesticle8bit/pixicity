import { Pipe, PipeTransform } from '@angular/core';

interface Interval {
  singular: string;
  plural: string;
  seconds: number;
}

const INTERVALS: Interval[] = [
  { singular: 'año', plural: 'años', seconds: 31536000 },
  { singular: 'mes', plural: 'meses', seconds: 2592000 },
  { singular: 'semana', plural: 'semanas', seconds: 604800 },
  { singular: 'día', plural: 'días', seconds: 86400 },
  { singular: 'hora', plural: 'horas', seconds: 3600 },
  { singular: 'minuto', plural: 'minutos', seconds: 60 },
  { singular: 'segundo', plural: 'segundos', seconds: 1 },
];

@Pipe({
  standalone: false,
  name: 'timeAgo',
  pure: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const date = new Date(value);
    const time = date.getTime();

    // Fecha inválida: devolvemos el valor original como texto
    if (isNaN(time)) {
      return String(value);
    }

    const deltaSeconds = Math.round((Date.now() - time) / 1000);
    const future = deltaSeconds < 0;
    const seconds = Math.abs(deltaSeconds);

    if (seconds < 30) {
      return future ? 'En unos segundos' : 'Hace unos segundos';
    }

    for (const interval of INTERVALS) {
      const counter = Math.floor(seconds / interval.seconds);

      if (counter > 0) {
        const unit = counter === 1 ? interval.singular : interval.plural;
        return future ? `En ${counter} ${unit}` : `Hace ${counter} ${unit}`;
      }
    }

    return '';
  }
}
