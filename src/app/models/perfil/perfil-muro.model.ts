import { ActividadViewModel } from '../logs/logs-vm.model';
import { MuroPost } from '../mi/mi-vm.model';
import { ShoutViewModel } from './shout-vm.model';

/** Secciones de la línea de tiempo del perfil (parámetro `filtro` de GET api/usuarios/{id}/muro). */
export type FiltroMuroPerfil = 'todo' | 'shouts' | 'posts' | 'comentarios' | 'reacciones' | 'comunidades';

/** Partes del muro que el dueño puede ocultar desde /cuenta (los shouts siempre se ven). Usuario.MuroOculto en el API. */
export type SeccionMuroPerfil =
  | 'compartidos'
  | 'posts'
  | 'comentarios'
  | 'puntos'
  | 'favoritos'
  | 'recomendaciones'
  | 'meGusta'
  | 'seguimientos'
  | 'comunidades'
  | 'fotos'
  | 'rangos'
  /** No es del muro: oculta "en línea" y "activo hace X" (se guarda en la misma lista). */
  | 'presencia';

/** Actividad de la línea de tiempo: lo de la pestaña Actividad más la clase del objeto y el texto de los comentarios. */
export interface ActividadMuro extends ActividadViewModel {
  /** post, shout, foto, comunidad, tema, usuario, rango o comentario. */
  tipo: string;
  /** Primeras palabras del comentario (texto plano). */
  extracto?: string | null;
}

/** Una entrada de la línea de tiempo del perfil. */
export interface MuroPerfilItem {
  tipo: 'shout' | 'reshout' | 'post' | 'actividad';
  /** Única en la lista (los ids de distintas tablas se repiten). */
  clave: string;
  fecha: string;
  shout: ShoutViewModel | null;
  compartidoPor: { userName: string; avatar: string | null } | null;
  post: MuroPost | null;
  actividad: ActividadMuro | null;
}

export interface MuroPerfil {
  items: MuroPerfilItem[];
  /** Cursor de la página siguiente (null: no hay más). */
  siguiente: string | null;
  /** Shout fijado por el dueño: solo en la primera página, y no se repite en la lista. */
  fijado: ShoutViewModel | null;
  /** Lo que el dueño ocultó: sus filtros no se muestran. */
  ocultas?: SeccionMuroPerfil[];
}
