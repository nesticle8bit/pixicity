import { Observable } from 'rxjs';
import { BloqueoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';

export abstract class IHttpBloqueosService {
  abstract getBloqueados(): Observable<BloqueoViewModel[]>;
  abstract bloquearUsuario(userName: string): Observable<number>;
  abstract desbloquearUsuario(bloqueadoId: number): Observable<boolean>;
  abstract esBloqueadoPor(userName: string): Observable<boolean>;
  abstract getBloqueoContraPerfil(userName: string): Observable<BloqueoViewModel | null>;
}
