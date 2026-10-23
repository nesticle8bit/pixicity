import { ChangeDetectionStrategy, Component, OnChanges, input, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VisorImagenService } from '../visor-imagen/visor-imagen.service';
import { embedYoutube, videoYoutube } from 'src/app/shared/helpers/youtube';

/**
 * Renderiza el media adjunto a un shout según su tipo:
 * - Video  -> embed de YouTube
 * - Spotify-> embed de Spotify
 * - Foto   -> imagen
 * - VideoArchivo -> <video> nativo (enlace directo a .mp4/.webm...)
 * - Enlace -> tarjeta con preview Open Graph (imagen + título + descripción)
 */
@Component({
    selector: 'app-shout-media',
    // Solo depende de sus inputs: se vuelve a evaluar únicamente cuando cambian.
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './shout-media.component.html',
    styleUrls: ['./shout-media.component.scss'],
})
export class ShoutMediaComponent implements OnChanges {
  private sanitizer = inject(DomSanitizer);
  private visor = inject(VisorImagenService);

  readonly url = input<string | null>(null);
  readonly tipo = input<string | null>(null);
  readonly mediaTitulo = input<string | null>(null);
  readonly mediaImagen = input<string | null>(null);
  /** La imagen no cargó (p. ej. la captura todavía se está generando): la tarjeta queda solo con el texto. */
  readonly imagenFallo = signal(false);
  readonly mediaDescripcion = input<string | null>(null);

  // URLs de embed memoizadas (se recalculan SOLO cuando cambian los inputs,
  // no en cada ciclo de change detection — evita que el iframe parpadee/recargue).
  public youtubeEmbed: SafeResourceUrl | null = null;
  public spotifyEmbed: SafeResourceUrl | null = null;
  public hostname = '';

  ngOnChanges(): void {
    this.hostname = this.calcularHostname();
    this.youtubeEmbed = this.esVideo ? this.calcularYoutubeEmbed() : null;
    this.spotifyEmbed = this.esSpotify ? this.calcularSpotifyEmbed() : null;
  }

  /** Clic normal: la imagen se abre en el visor de la plataforma. Ctrl/Cmd/Shift o la rueda abren otra pestaña (el href). */
  abrirFoto(event: MouseEvent): void {
    const url = this.url();
    if (!url || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    event.stopPropagation(); // la tarjeta del shout no debe navegar al detalle
    this.visor.abrir(url, 'Imagen del shout');
  }

  get tieneMedia(): boolean {
    return !!this.url() && this.tipo() !== 'Texto';
  }

  get esVideo(): boolean { return this.tipo() === 'Video'; }
  get esSpotify(): boolean { return this.tipo() === 'Spotify'; }
  get esFoto(): boolean { return this.tipo() === 'Foto'; }
  get esEnlace(): boolean { return this.tipo() === 'Enlace'; }
  get esVideoArchivo(): boolean { return this.tipo() === 'VideoArchivo'; }

  private calcularHostname(): string {
    try { return new URL(this.url()!).hostname.replace('www.', ''); }
    catch { return this.url() || ''; }
  }

  private calcularYoutubeEmbed(): SafeResourceUrl | null {
    const url = this.url();
    if (!url) return null;
    const video = videoYoutube(url);
    if (!video) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedYoutube(video));
  }

  private calcularSpotifyEmbed(): SafeResourceUrl | null {
    const url = this.url();
    if (!url) return null;
    // Soporta el segmento de idioma opcional (ej: /intl-es/track/...).
    const m = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
    if (!m) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://open.spotify.com/embed/${m[1]}/${m[2]}`);
  }
}
