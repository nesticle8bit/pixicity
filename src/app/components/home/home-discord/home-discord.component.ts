import { ChangeDetectionStrategy, Component, OnInit, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { enNavegador } from '../../../shared/helpers/plataforma';

const SERVIDOR_ID = '974706838157291600';
const INVITACION = 'https://discord.gg/rBs8xGTV5S';
const MAX_AVATARES = 6;

/** Lo que usamos de https://discord.com/api/guilds/{id}/widget.json (el widget público del servidor). */
interface WidgetDiscord {
  name?: string;
  instant_invite?: string | null;
  presence_count?: number;
  members?: { id: string; username: string; avatar_url?: string }[];
}

/**
 * Tarjeta de Discord de la portada, del tamaño del carrusel "Top Fotos" (4:3). Muestra en vivo el nombre del
 * servidor, cuántos están en línea y algunos avatares, con los datos del widget público de Discord. Si Discord no
 * responde (o el widget está desactivado), la tarjeta se ve igual, sin los datos en vivo.
 *
 * `variante`: 'cuadrado' (4:3, para columnas) o 'horizontal' (franja baja, para banners tipo 728x90).
 */
@Component({
  selector: 'app-home-discord',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './home-discord.component.html',
  styleUrl: './home-discord.component.scss',
  host: { '[class.horizontal]': "variante() === 'horizontal'" },
})
export class HomeDiscordComponent implements OnInit {
  readonly variante = input<'cuadrado' | 'horizontal'>('cuadrado');
  readonly mostrarTitulo = input(true);

  readonly nombre = signal('Taringas! en Discord');
  readonly enLinea = signal<number | null>(null);
  readonly avatares = signal<{ id: string; nombre: string; url: string }[]>([]);
  readonly invitacion = signal(INVITACION);

  ngOnInit(): void {
    // Solo en el navegador: el render del servidor (para bots) no debe esperar a Discord.
    if (enNavegador()) void this.cargar();
  }

  /** Avatares que no se muestran ("+N"). */
  restantes(): number {
    const total = this.enLinea() ?? 0;
    return Math.max(0, total - this.avatares().length);
  }

  private async cargar(): Promise<void> {
    try {
      // fetch directo (no HttpClient): así no pasa por los interceptores del sitio (token, reintentos, avisos de error).
      const respuesta = await fetch(`https://discord.com/api/guilds/${SERVIDOR_ID}/widget.json`, { credentials: 'omit' });
      if (!respuesta.ok) return;
      const datos = (await respuesta.json()) as WidgetDiscord;

      if (datos.name) this.nombre.set(datos.name);
      if (typeof datos.presence_count === 'number') this.enLinea.set(datos.presence_count);
      if (datos.instant_invite?.startsWith('https://discord.')) this.invitacion.set(datos.instant_invite);
      this.avatares.set(
        (datos.members ?? [])
          .filter((m) => m.avatar_url?.startsWith('https://cdn.discordapp.com/'))
          .slice(0, MAX_AVATARES)
          .map((m) => ({ id: m.id, nombre: m.username, url: m.avatar_url! }))
      );
    } catch {
      // Discord caído, bloqueado o widget desactivado: la tarjeta sigue sirviendo como invitación.
    }
  }
}
