import {
  AudienciaAnuncio,
  ComponenteAnuncio,
  DispositivoAnuncio,
  TipoAnuncio,
  VarianteAnuncio,
} from 'src/app/components/ads/anuncios';

/** Lo que el admin edita de un anuncio (POST /api/anuncios y PUT /api/anuncios/{id}). */
export interface AnuncioGuardar {
  id?: number;
  nombre: string;
  tipo: TipoAnuncio;
  html?: string | null;
  imagenUrl?: string | null;
  enlaceUrl?: string | null;
  textoAlternativo?: string | null;
  ancho?: number | null;
  alto?: number | null;
  componente?: ComponenteAnuncio | null;
  variante?: VarianteAnuncio | null;
  ubicaciones: string[];
  categoriaIds: number[];
  comunidadIds: number[];
  dispositivo: DispositivoAnuncio;
  audiencia: AudienciaAnuncio;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  peso: number;
  activo: boolean;
}

/** Fila de la tabla del admin. */
export interface AnuncioAdmin extends AnuncioGuardar {
  id: number;
  fechaRegistro: string;
  impresiones30Dias: number;
  clics30Dias: number;
}

export interface OpcionAnuncio {
  id: string;
  nombre: string;
}

export interface AnuncioOpciones {
  ubicaciones: OpcionAnuncio[];
  categorias: OpcionAnuncio[];
  comunidades: OpcionAnuncio[];
}

export interface AnuncioEstadisticaDia {
  fecha: string;
  impresiones: number;
  clics: number;
}

/** CTR en porcentaje con un decimal (0 si no hubo impresiones). */
export function ctr(impresiones: number, clics: number): number {
  return impresiones > 0 ? Math.round((clics / impresiones) * 1000) / 10 : 0;
}
