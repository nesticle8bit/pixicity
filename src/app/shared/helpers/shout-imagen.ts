import { ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';
import { miniaturaYoutube, videoYoutube } from './youtube';

/** Imagen que representa al shout: la foto, la miniatura de YouTube o la vista previa del enlace. */
export function imagenShout(s: ShoutViewModel): string | null {
  if (s.tipo === 'Foto') return s.url;
  if (s.tipo === 'Video') {
    const video = videoYoutube(s.url);
    return video ? miniaturaYoutube(video.id) : null;
  }
  return s.mediaImagen || null;
}

/** El detalle vive en el muro donde se publicó. */
export function enlaceShout(s: ShoutViewModel): (string | number)[] {
  return ['/shouts', s.perfil?.userName ?? s.avatar?.userName ?? '', s.id];
}
