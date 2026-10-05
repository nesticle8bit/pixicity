// Configuración del sitio y mensajes de contacto, tal como los devuelve el API (entidades Configuracion y Contacto).

export interface ConfiguracionModel {
  id: number;
  siteName: string;
  slogan: string;
  url: string;
  dateCreated: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  disableUserRegistration: boolean;
  disableUserRegistrationMessage: string;
  onlineUsersTime: string;
  // OJO: el API los llama headerScript / footerScript (no scriptHeader / scriptFooter).
  headerScript: string;
  footerScript: string;
  banner300x250: string;
  banner468x60: string;
  banner160x600: string;
  banner728x90: string;
  recordOnlineUsers: number;
  recordOnlineTime: string;
  welcomeUserId: number | null;
  welcomeActivated: boolean;
  welcomeMessage: string;
  footer: string;
}

export interface ContactoModel {
  id: number;
  nombre: string;
  email: string;
  medio: string;
  comentarios: string;
  gestionado: boolean;
  fechaRegistro: string;
}
