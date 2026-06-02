import { UsuarioAvatarViewModel } from '../seguridad/seguridad-vm.model';

export interface MensajeViewModel {
  id: number;
  fechaRegistro: string;
  asunto: string;
  contenido: string;
  leido: boolean;
  eliminado: boolean;
  usuarioDe: UsuarioAvatarViewModel;
  usuarioA: UsuarioAvatarViewModel;
}

export interface SendMPViewModel {
  aUserName: string;
  asunto: string;
  contenido: string;
}

export interface ResponseMPViewModel {
  type: string;
  message: string;
}
