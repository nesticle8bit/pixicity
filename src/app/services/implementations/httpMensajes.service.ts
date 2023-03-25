import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { PaginationService } from '../shared/pagination.service';
import { IHttpMensajesService } from '../interfaces/httpMensajes.interface';

@Injectable()
export class HttpMensajesService implements IHttpMensajesService {
  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private paginationService: PaginationService
  ) {}

  getMensajes(search: any): Observable<any> {
    return this.http
      .get<any>(
        `${environment.api}/api/mensajes/getMensajes?page=${this.paginationService.page}&pageCount=${this.paginationService.pageCount}`
      )
      .pipe(
        map((response: any) => {
          if (response.status === 200) {
            return response.data;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.errors.join(', '),
            });
          }
        })
      )
      .pipe(catchError(this.helper.errorHandler));
  }
}
