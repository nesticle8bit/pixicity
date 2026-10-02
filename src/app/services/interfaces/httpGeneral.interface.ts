import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AfiliacionModel } from 'src/app/models/general/afiliacion.model';
import { DashboardResumen } from 'src/app/models/admin/dashboard.model';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { FavoritosViewModel } from 'src/app/models/posts/post-vm.model';
import { EstadisticasViewModel } from 'src/app/models/seguridad/seguridad-vm.model';

@Injectable()
export abstract class IHttpGeneralService {
  abstract getEstadisticas(): Observable<EstadisticasViewModel>;
  abstract getAdminEstadisticas(): Observable<unknown>;
  abstract getDashboardResumen(): Observable<DashboardResumen>;
  abstract getAfiliados(): Observable<AfiliacionModel[]>;
  abstract saveAfiliacion(afiliacion: AfiliacionModel): Observable<number>;
  abstract getFavoritosByUser(search: string, categoriaId: number): Observable<PaginatedData<FavoritosViewModel>>;
  abstract getConfiguracion(): Observable<unknown>;
  abstract updateConfiguracion(configuracion: unknown): Observable<boolean>;
  abstract updateAds(configuration: unknown): Observable<boolean>;
  abstract updateAfiliacion(afiliacion: AfiliacionModel): Observable<boolean>;
  abstract setHitInByRefCode(refCode: string): Observable<boolean>;
  abstract deleteAfiliado(id: number): Observable<boolean>;
  abstract getContactos(): Observable<unknown>;
  abstract getContactosPendientes(): Observable<number>;
  abstract saveContacto(contacto: unknown): Observable<boolean>;
  abstract gestionarContacto(contactoId: number): Observable<boolean>;
  abstract deleteContacto(contactoId: number): Observable<boolean>;
}
