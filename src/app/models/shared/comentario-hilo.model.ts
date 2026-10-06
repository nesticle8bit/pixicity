import { Observable } from 'rxjs';

/**
 * Comentario en el formato común de <app-comentarios>. Cada sección (temas, posts, fotos) convierte lo que devuelve
 * su API a esta forma; el componente no sabe de dónde viene.
 */
export interface ComentarioHilo {
  id: number;
  /** null en los comentarios raíz. Las respuestas siempre cuelgan del raíz (un solo nivel). */
  parentId: number | null;
  contenido: string;
  fecha: string;
  /** Fecha de la última edición, o null si nunca se editó. */
  fechaEdicion: string | null;
  userName: string;
  avatar: string | null;
  rango: { nombre: string; color: string | null; icono: string | null } | null;
  votos: number;
  /** -1, 0 o 1. */
  miVoto: number;
  votosArriba: number;
  votosAbajo: number;
  fijado: boolean;
  denunciasPendientes: number;
  /** Versiones anteriores (solo posts las guarda). Si existe, "editado" abre el historial. */
  historial?: { fecha: string; contenido: string }[];
}

export interface ResultadoVotoComentario {
  total: number;
  miVoto: number;
}

/** Llamadas al API que <app-comentarios> necesita. Cada sección las implementa con su propio servicio. */
export interface ComentariosAcciones {
  /** Publica un comentario (parentId = id del comentario raíz al responder). Devuelve el id nuevo. */
  comentar(contenido: string, parentId: number | null): Observable<number>;
  editar(id: number, contenido: string): Observable<unknown>;
  eliminar(id: number): Observable<unknown>;
  votar(id: number, valor: 1 | -1): Observable<ResultadoVotoComentario>;
  fijar(id: number): Observable<boolean>;
  denunciar(id: number, motivo: string): Observable<unknown>;
}

export type OrdenComentarios = 'mejores' | 'recientes' | 'controvertido';
