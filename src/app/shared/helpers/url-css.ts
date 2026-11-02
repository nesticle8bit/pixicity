/** Portada del perfil (profileBackground): enlace http(s) a un .jpg o .png. La misma regla valida el API. */
export const PORTADA_VALIDA = /^https?:\/\/\S+\.(jpe?g|png)(\?\S*)?$/i;

/** url("…") para CSS, sin comillas ni paréntesis que puedan cerrar el url() (la URL es texto del usuario). */
export function urlCss(url: string | null | undefined): string | null {
  const limpia = (url ?? '').trim().replace(/["()\\]/g, '');
  return /^https?:\/\//i.test(limpia) ? `url("${limpia}")` : null;
}
