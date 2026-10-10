import { AfiliadoAdmin, ContactoAdmin } from 'src/app/models/admin/filas-admin.model';
import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
import { ConfiguracionModel, ContactoModel } from 'src/app/models/general/configuracion.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AfiliacionModel } from 'src/app/models/general/afiliacion.model';
import { DashboardResumen, MetricasApi } from 'src/app/models/admin/dashboard.model';
import { PaginatedData, PaginatedWithCategorias } from 'src/app/models/api/api-response.model';
import { FavoritosViewModel } from 'src/app/models/posts/post-vm.model';
import { EstadisticasViewModel } from 'src/app/models/seguridad/seguridad-vm.model';

@Injectable()
export abstract class IHttpGeneralService {
  abstract getEstadisticas(): Observable<EstadisticasViewModel>;
  abstract getAdminEstadisticas(): Observable<unknown>;
  abstract getDashboardResumen(): Observable<DashboardResumen>;
  abstract getMetricasApi(minutos: number): Observable<MetricasApi>;
  abstract getAfiliados(filtro?: AdminFiltro): Observable<PaginatedData<AfiliadoAdmin>>;
  abstract saveAfiliacion(afiliacion: AfiliacionModel): Observable<number>;
  abstract getFavoritosByUser(search: string, categoriaId: number): Observable<PaginatedWithCategorias<FavoritosViewModel, 'favoritos'>>;
  abstract getConfiguracion(): Observable<ConfiguracionModel>;
  abstract updateConfiguracion(configuracion: Partial<ConfiguracionModel>): Observable<boolean>;
  abstract updateAds(configuration: Partial<ConfiguracionModel>): Observable<boolean>;
  abstract updateAfiliacion(afiliacion: AfiliacionModel): Observable<boolean>;
  abstract setHitInByRefCode(refCode: string): Observable<boolean>;
  abstract deleteAfiliado(id: number): Observable<boolean>;
  abstract getContactos(filtro?: AdminFiltro): Observable<PaginatedData<ContactoAdmin, 'contactos'>>;
  abstract getContactosPendientes(): Observable<number>;
  abstract saveContacto(contacto: unknown): Observable<boolean>;
  abstract gestionarContacto(contactoId: number): Observable<boolean>;
  abstract deleteContacto(contactoId: number): Observable<boolean>;
}
