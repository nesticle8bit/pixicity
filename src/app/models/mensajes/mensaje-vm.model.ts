import { UsuarioAvatarViewModel } from '../seguridad/seguridad-vm.model';

export interface MensajeViewModel {
  id: number;
  fechaRegistro: string;
  asunto: string;
  contenido: string;
  leido: boolean;
  eliminado: boolean;
  esMio?: boolean;
  usuarioDe: UsuarioAvatarViewModel;
  usuarioA: UsuarioAvatarViewModel;
}

export interface ConversacionViewModel {
  ultimoMensajeId: number;
  fechaRegistro: string;
  asunto: string;
  contenido: string;
  esMio: boolean;
  leido: boolean;
  noLeidos: number;
  otro: UsuarioAvatarViewModel;
}

export interface ConversacionPage {
  mensajes: MensajeViewModel[];
  hayMas: boolean;
  bloqueado: boolean;
  otro: UsuarioAvatarViewModel;
}

export interface ConversacionParams {
  id?: number;
  userName?: string;
  antesDeId?: number;
  take?: number;
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
