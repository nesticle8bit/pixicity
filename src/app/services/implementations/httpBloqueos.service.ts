import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { NotificationService } from '../shared/notification.service';
import { IHttpBloqueosService } from '../interfaces/httpBloqueos.interface';
import { ApiResponse } from 'src/app/models/api/api-response.model';
import { BloqueoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';

@Injectable()
export class HttpBloqueosService implements IHttpBloqueosService {
  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private notificationService: NotificationService,
  ) {}

  getBloqueados(): Observable<BloqueoViewModel[]> {
    return this.http
      .get<ApiResponse<BloqueoViewModel[]>>(`${environment.api}/api/bloqueos/getBloqueados`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  bloquearUsuario(userName: string): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(
        `${environment.api}/api/bloqueos/bloquearUsuario`,
        JSON.stringify(userName),
        { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) },
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  desbloquearUsuario(bloqueadoId: number): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(
        `${environment.api}/api/bloqueos/desbloquearUsuario`,
        bloqueadoId,
        { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) },
      )
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  getBloqueoContraPerfil(userName: string): Observable<BloqueoViewModel | null> {
    return this.http
      .get<ApiResponse<BloqueoViewModel | null>>(`${environment.api}/api/bloqueos/getBloqueoContraPerfil/${userName}`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data ?? null;
          } else {
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }

  esBloqueadoPor(userName: string): Observable<boolean> {
    return this.http
      .get<ApiResponse<boolean>>(`${environment.api}/api/bloqueos/esBloqueadoPor/${userName}`)
      .pipe(
        map((response) => {
          if (response.status === 200) {
            return response.data!;
          } else {
            this.notificationService.error(response.errors.join(', '), 'Error');
            throw new Error(response.errors?.join(', ') ?? 'Error');
          }
        }),
      )
      .pipe(catchError(this.helper.errorHandler));
  }
}
