import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Renderiza el media adjunto a un shout según su tipo:
 * - Video  -> embed de YouTube
 * - Spotify-> embed de Spotify
 * - Foto   -> imagen
 * - Enlace -> tarjeta con preview Open Graph (imagen + título + descripción)
 */
@Component({
  standalone: false,
  selector: 'app-shout-media',
  templateUrl: './shout-media.component.html',
  styleUrls: ['./shout-media.component.scss'],
})
export class ShoutMediaComponent implements OnChanges {
  @Input() url: string | null = null;
  @Input() tipo: string | null = null;
  @Input() mediaTitulo: string | null = null;
  @Input() mediaImagen: string | null = null;
  @Input() mediaDescripcion: string | null = null;

  // URLs de embed memoizadas (se recalculan SOLO cuando cambian los inputs,
  // no en cada ciclo de change detection — evita que el iframe parpadee/recargue).
  public youtubeEmbed: SafeResourceUrl | null = null;
  public spotifyEmbed: SafeResourceUrl | null = null;
  public hostname = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    this.hostname = this.calcularHostname();
    this.youtubeEmbed = this.esVideo ? this.calcularYoutubeEmbed() : null;
    this.spotifyEmbed = this.esSpotify ? this.calcularSpotifyEmbed() : null;
  }

  get tieneMedia(): boolean {
    return !!this.url && this.tipo !== 'Texto';
  }

  get esVideo(): boolean { return this.tipo === 'Video'; }
  get esSpotify(): boolean { return this.tipo === 'Spotify'; }
  get esFoto(): boolean { return this.tipo === 'Foto'; }
  get esEnlace(): boolean { return this.tipo === 'Enlace'; }

  private calcularHostname(): string {
    try { return new URL(this.url!).hostname.replace('www.', ''); }
    catch { return this.url || ''; }
  }

  private calcularYoutubeEmbed(): SafeResourceUrl | null {
    if (!this.url) return null;
    const id = this.extractYoutubeId(this.url);
    if (!id) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${id}`);
  }

  private calcularSpotifyEmbed(): SafeResourceUrl | null {
    if (!this.url) return null;
    // Soporta el segmento de idioma opcional (ej: /intl-es/track/...).
    const m = this.url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
    if (!m) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://open.spotify.com/embed/${m[1]}/${m[2]}`);
  }

  private extractYoutubeId(url: string): string | null {
    const patterns = [
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }
}
