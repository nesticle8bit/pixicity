// Una acción de moderación del historial público (HistorialViewModel).
export interface HistorialViewModel {
  id: number;
  titulo: string;
  autor: string;
  accion: string;
  moderador: string;
  causa: string;
}
