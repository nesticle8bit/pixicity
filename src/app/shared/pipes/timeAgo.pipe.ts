import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeAgo',
    pure: true
})
export class TimeAgoPipe implements PipeTransform {
    transform(value: any): any {
        if (value) {
            const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);

            if (seconds < 29) {
                return 'Hace unos segundos';
            }

            const intervals: any = {
                'año': 31536000,
                'mes': 2592000,
                'semana': 604800,
                'día': 86400,
                'hora': 3600,
                'minuto': 60,
                'segundo': 1
            };

            let counter;

            for (const i in intervals) {
                counter = Math.floor(seconds / intervals[i]);

                if (counter > 0)
                    if (counter === 1) {
                        return `Hace ${counter} ${i}`;
                    } else {
                        return `Hace ${counter} ${i === 'mes' ? 'mese' : i}s`;
                    }
            }
        }
        return value;
    }

}