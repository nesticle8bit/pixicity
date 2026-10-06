import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';
import { AppLog, AppLogFiltro, AppLogResumen } from 'src/app/models/logs/app-log.model';

@Injectable()
export abstract class IHttpAppLogsService {
  abstract getLogs(page: number, pageCount: number, filtro: AppLogFiltro): Observable<PaginatedData<AppLog>>;
  abstract getLog(id: number): Observable<AppLog>;
  abstract getResumen(): Observable<AppLogResumen>;
  abstract resolver(id: number, todosLosIguales: boolean): Observable<number>;
  abstract resolverTodos(filtro: AppLogFiltro): Observable<number>;
}
