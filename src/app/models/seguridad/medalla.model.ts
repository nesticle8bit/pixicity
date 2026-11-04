export type NivelMedalla = 'Bronce' | 'Plata' | 'Oro' | 'Platino' | 'Especial';

export const NIVELES_MEDALLA: NivelMedalla[] = ['Bronce', 'Plata', 'Oro', 'Platino', 'Especial'];

/** Medalla del catálogo (panel admin). */
export interface Medalla {
  id: number;
  slug: string;
  titulo: string;
  descripcion: string | null;
  /** "assets/medallas/x.png" (de serie) o una URL https. */
  imagen: string;
  nivel: NivelMedalla;
  orden: number;
  activa: boolean;
  /** Se gana sola con esta regla (null = solo la otorga un admin). */
  regla: string | null;
  /** Reglas por umbral: cantidad a alcanzar. */
  umbral: number | null;
  /** Reglas de ranking: 'dia' | 'semana' | 'mes' | 'anio'. */
  periodo: string | null;
  /** Reglas de ranking: puesto que la gana (1 a 3). */
  puesto: number | null;
  /** Cuántos usuarios la tienen. */
  otorgadas: number;
}

/** Regla automática que ofrece el API (GET api/medallas/reglas). */
export interface ReglaMedalla {
  codigo: string;
  nombre: string;
  esRanking: boolean;
  /** Qué se cuenta en las reglas por umbral (seguidores, puntos...); null = la regla no usa umbral. */
  unidad: string | null;
}

export const NOMBRES_PERIODO: Record<string, string> = { dia: 'Día', semana: 'Semana', mes: 'Mes', anio: 'Año' };

/** "≥ 500 seguidores", "1º de la semana"… para la tabla del panel. */
export function describirRegla(m: Pick<Medalla, 'regla' | 'umbral' | 'periodo' | 'puesto'>, reglas: ReglaMedalla[]): string {
  const regla = reglas.find((r) => r.codigo === m.regla);
  if (!m.regla || !regla) return '';
  if (regla.esRanking) return `${regla.nombre} · ${m.puesto}º · ${NOMBRES_PERIODO[m.periodo ?? ''] ?? m.periodo}`;
  return regla.unidad ? `${regla.nombre} ≥ ${m.umbral}` : regla.nombre;
}

/** Medalla en el perfil de un usuario. */
export interface MedallaUsuario {
  medallaId: number;
  slug: string;
  titulo: string;
  descripcion: string | null;
  imagen: string;
  nivel: NivelMedalla;
  motivo: string | null;
  fecha: string;
}

/** Usuario que tiene una medalla (panel admin). */
export interface MedallaOtorgada {
  usuarioId: number;
  userName: string;
  avatar: string | null;
  motivo: string | null;
  fecha: string;
  otorgadaPor: string | null;
}

/** Imagen lista para el src: las de serie son relativas a la raíz del sitio. */
export function srcMedalla(imagen: string): string {
  return /^https:\/\//i.test(imagen) ? imagen : `/${imagen.replace(/^\/+/, '')}`;
}
