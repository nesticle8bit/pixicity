import { PostViewModel } from '../posts/post-vm.model';
import { UsuarioViewModel } from '../seguridad/seguridad-vm.model';

export interface MonitorViewModel {
  id: number;
  fechaRegistro: string;
  leido: boolean;
  eliminado: boolean;
  mensaje: string;
  postId?: number;
  tipoString: string;
  usuarioQueHaceAccion: UsuarioViewModel;
  post: PostViewModel;
}

export interface StatsViewModel {
  notifications: number;
  messages: number;
}

export interface ActividadViewModel {
  id: number;
  fechaRegistro: string;
  tipoString: string;
  mensaje: string;
  userName: string;
  avatar: string;
}
