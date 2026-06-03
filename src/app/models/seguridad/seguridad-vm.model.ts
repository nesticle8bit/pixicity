import { EstadoViewModel, PaisViewModel } from '../parametros/parametros-vm.model';

export interface RangoUsuarioViewModel {
  id: number;
  nombre: string;
  icono: string;
  color: string;
}

export interface UsuarioAvatarViewModel {
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
  rango: RangoUsuarioViewModel;
  fechaNacimiento: string;
  edad: number;
  pais: PaisViewModel;
}

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
