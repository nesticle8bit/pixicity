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

export interface Silencios {
  usuarios: UsuarioSilenciado[];
  palabras: PalabraSilenciada[];
}
