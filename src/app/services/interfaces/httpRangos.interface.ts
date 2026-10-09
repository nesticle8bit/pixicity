import { AdminFiltro } from 'src/app/models/admin/admin-filtro.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { DropdownViewModel } from 'src/app/models/parametros/parametros-vm.model';
import { RangoUsuarioReportViewModel } from 'src/app/models/seguridad/seguridad-vm.model';

/** Rangos de usuario: listado, alta/edición, asignación manual y recálculo por puntos. */
@Injectable()
export abstract class IHttpRangosService {
  abstract getRangosUsuarios(filtro?: AdminFiltro): Observable<PaginatedData<unknown, 'rangos'>>;
  abstract getRangosDropdown(): Observable<DropdownViewModel[]>;
  abstract addUpdateRango(rango: unknown): Observable<number>;
  abstract changeRango(rangoUsuario: { userId: number; rangoId: number }): Observable<boolean>;
  abstract changeUsuariosRangosByPuntos(): Observable<RangoUsuarioReportViewModel[]>;
}
