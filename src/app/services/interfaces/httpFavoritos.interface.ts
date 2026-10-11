import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export abstract class IHttpFavoritosService {
    abstract getLastFavoritos(count: number): Observable<any>;
    /** Alterna: quita el favorito o lo recupera. `eliminado` es el estado final. */
    abstract deleteFavorito(favoritoId: number): Observable<{ favoritoId: number; eliminado: boolean }>;
}
