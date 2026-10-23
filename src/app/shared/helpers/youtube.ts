/**
 * Videos de YouTube en el contenido de posts y temas.
 *
 * En el HTML se guarda una miniatura enlazada, no un <iframe>: el [innerHTML] de Angular quita los iframes, y así el
 * video también se ve (como enlace) en el SSR, en los bots y donde no corre la directiva `appContenidoPost`, que es
 * la que la cambia por el reproductor al hacer clic.
 *
 *   <figure class="video-yt"><a href="https://www.youtube.com/watch?v=ID"><img src="…/hqdefault.jpg"></a></figure>
 */
export interface VideoYoutube {
  id: string;
  /** Segundo en el que empieza (parámetro t= o start= del enlace). */
  inicio: number;
}

export const CLASE_VIDEO_YOUTUBE = 'video-yt';

const ID = /^[\w-]{11}$/;
const HOSTS = ['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com'];

/** Video de un enlace de YouTube (watch, youtu.be, shorts, live, embed); null si no es uno. */
export function videoYoutube(texto: string | null | undefined): VideoYoutube | null {
  const limpio = (texto || '').trim();
  if (!limpio || /\s/.test(limpio)) return null;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(limpio) ? limpio : `https://${limpio}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const partes = url.pathname.split('/').filter(Boolean);
  let id: string | null = null;
  if (host === 'youtu.be') {
    id = partes[0] ?? null;
  } else if (HOSTS.includes(host)) {
    if (partes[0] === 'watch') id = url.searchParams.get('v');
    else if (['shorts', 'live', 'embed', 'v'].includes(partes[0])) id = partes[1] ?? null;
  }
  if (!id || !ID.test(id)) return null;

  return { id, inicio: segundos(url.searchParams.get('t') ?? url.searchParams.get('start')) };
}

// "90", "90s", "1m30s", "1h2m3s"
function segundos(valor: string | null): number {
  if (!valor) return 0;
  if (/^\d+s?$/.test(valor)) return parseInt(valor, 10);
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(valor);
  if (!m) return 0;
  return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
}

export function enlaceYoutube(video: VideoYoutube): string {
  return `https://www.youtube.com/watch?v=${video.id}${video.inicio ? `&t=${video.inicio}s` : ''}`;
}

export function miniaturaYoutube(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/** Reproductor sin cookies de seguimiento hasta que se reproduce. */
export function embedYoutube(video: VideoYoutube, autoplay = false): string {
  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  if (video.inicio) params.set('start', `${video.inicio}`);
  const query = params.toString();
  return `https://www.youtube-nocookie.com/embed/${video.id}${query ? `?${query}` : ''}`;
}
