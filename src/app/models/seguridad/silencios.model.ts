export interface UsuarioSilenciado {
  id: number;
  userName: string;
  avatar: string | null;
  fecha: string;
}

export interface PalabraSilenciada {
  id: number;
  palabra: string;
  fecha: string;
}

/** Shout ocultado con "No me interesa": no vuelve a aparecer en el muro de /mi. */
export interface ShoutOculto {
  shoutId: number;
  autor: string;
  avatar: string | null;
  /** Primeras palabras del shout, sin HTML. */
  extracto: string;
  fecha: string;
}

export interface Silencios {
  usuarios: UsuarioSilenciado[];
  palabras: PalabraSilenciada[];
  /** Los últimos 100 ocultados. */
  shouts: ShoutOculto[];
}
