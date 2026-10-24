import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { FavoritosViewModel } from "src/app/models/posts/post-vm.model";

@Injectable()
export abstract class IHttpFavoritosService {
    abstract getLastFavoritos(count: number): Observable<FavoritosViewModel[]>;
    /** Alterna: quita el favorito o lo recupera. `eliminado` es el estado final. */
    abstract deleteFavorito(favoritoId: number): Observable<{ favoritoId: number; eliminado: boolean }>;
}
