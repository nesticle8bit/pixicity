import { EstadoViewModel, PaisViewModel } from '../parametros/parametros-vm.model';

export interface RangoUsuarioViewModel {
  id: number;
  nombre: string;
  icono: string;
  color: string;
}

export interface UsuarioAvatarViewModel {
  id: number;
  userName: string;
  avatar: string;
}

export interface UsuarioViewModel {
  avatar: string;
  userName: string;
  password?: string;
  paisId?: number;
  estadoId: number;
  genero: number;
  email: string;
  fechaNacimiento: string;
  rango: RangoUsuarioViewModel;
  generoString: string;
  estado: EstadoViewModel;
}

/** Fila del listado de usuarios del panel admin (UsuarioAdminViewModel del API). */
export interface UsuarioAdminViewModel {
  id: number;
  fechaRegistro: string;
  userName: string;
  email: string;
  genero: string | null;
  puntos: number;
  ultimaConexion: string | null;
  ultimaIP: string | null;
  baneado: boolean;
  tiempoBaneado: string | null;
  razonBaneo: string | null;
  baneadoPermanente: boolean;
  usuarioElimina: string | null;
  fechaElimina: string | null;
  avatar: string | null;
  cantidadPosts: number;
  cantidadComentarios: number;
  estado: { nombre: string; pais: { nombre: string; iso2: string } | null } | null;
  eliminado: boolean;
}

export interface PerfilUsuarioViewModel {
  id: number;
  avatar: string;
  profileBackground: string;
  userName: string;
  completeName: string;
  mensajePersonal: string;
  website: string;
  fechaRegistro: string;
  puntos: number;
  comentariosCount: number;
  postsCount: number;
  seguidoresCount: number;
  siguiendoCount: number;
  genero: string;
  rango: RangoUsuarioViewModel | null;
  fechaNacimiento: string;
  edad: number;
  pais: PaisViewModel | null;
}

/** Respuesta de usuarioPerfil/getUsuarioInfo: tarjeta del autor (posts, temas, popover). */
export interface UsuarioInfoViewModel {
  userName: string;
  completeName: string;
  avatar: string;
  genero: string;
  mensajePersonal: string;
  puntos: number | null;
  postsCount: number;
  comentariosCount: number;
  seguidoresCount: number;
  fechaRegistro: string;
  rango: RangoUsuarioViewModel | null;
  pais: { nombre: string; iso2: string } | null;
}

/** Lo que las secciones del perfil necesitan del dueño. Mientras el perfil carga llega SIN_PERFIL (id 0). */
export type PerfilRef = Pick<PerfilUsuarioViewModel, 'id' | 'userName'>;
export const SIN_PERFIL: PerfilRef = { id: 0, userName: '' };

/** Perfil completo vacío: lo que muestra /perfil/:usuario hasta que llega la respuesta. */
export const PERFIL_VACIO: PerfilUsuarioViewModel = {
  id: 0, avatar: '', profileBackground: '', userName: '', completeName: '', mensajePersonal: '', website: '',
  fechaRegistro: '', puntos: 0, comentariosCount: 0, postsCount: 0, seguidoresCount: 0, siguiendoCount: 0,
  genero: '', rango: null, fechaNacimiento: '', edad: 0, pais: null,
};

export interface UsuarioOnlineViewModel {
  userName: string;
  avatar: string;
}

export interface OnlineUsersListViewModel {
  registrados: UsuarioOnlineViewModel[];
  invitados: number;
  total: number;
}

export interface BloqueoViewModel {
  id: number;
  bloqueadoId: number;
  userName: string;
  avatar: string;
  fechaRegistro: string;
}

export interface EstadisticasViewModel {
  onlineUsers: OnlineUsersListViewModel;
  totalUsuarios: number;
  totalPosts: number;
  totalComentarios: number;
}

export interface UsuarioPerfilViewModel {
  usuarioId: number;
  completeName: string;
  personalMessage: string;
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  like1: boolean;
  like2: boolean;
  like3: boolean;
  like4: boolean;
  like_All: boolean;
  estadoCivil: string;
  hijos: string;
  vivoCon: string;
  altura: string;
  peso: string;
  colorCabello: string;
  colorOjos: string;
  complexion: string;
  dieta: string;
  tatuajes: boolean;
  piercings: boolean;
  fumo: string;
  alcohol: string;
  estudios: string;
  profesion: string;
  empresa: string;
  sector: string;
  interesesProfesionales: string;
  habilidadesProfesionales: string;
  misIntereses: string;
  hobbies: string;
  seriesTV: string;
  musicaFavorita: string;
  deportesFavoritos: string;
  librosFavoritos: string;
  peliculasFavoritas: string;
  comidaFavorita: string;
  misHeroesSon: string;
}

/** Respuesta de getCurrentPerfilInfo: el perfil viene envuelto en { perfil } junto al fondo del perfil del usuario. */
export interface PerfilInfoResponse {
  perfil: UsuarioPerfilViewModel | null;
  background?: string | null;
}

export interface RangoUsuarioReportViewModel {
  usuarioId: number;
  userName: string;
  rango: RangoUsuarioViewModel;
}

export interface UsuarioFollowerViewModel {
  avatar: string;
  userName: string;
  genero: string;
  pais: { nombre: string; iso2: string };
  puntos: number;
}

/** Respuesta de getLastFollowersByUserId. */
export interface SeguidoresResponse {
  followers: UsuarioFollowerViewModel[];
  totalCount: number;
}
