import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpWebService } from '../interfaces/httpWeb.interface';
import { PaginationService } from '../shared/pagination.service';
import { environment } from 'src/environments/environment';
import { HelperService } from '../shared/helper.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TopUserModel } from 'src/app/models/web/topUser.model';
import { TopPostModel } from 'src/app/models/web/topPost.model';

@Injectable()
export class HttpWebService implements IHttpWebService {
  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private router: Router,
    private paginationService: PaginationService
  ) {}

  getTopUsers(): Observable<TopUserModel[]> {
    return this.http
      .get<any>(`${environment.api}/api/tops/getTopUsers`)
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

  getTopPosts(date: string): Observable<TopPostModel[]> {
    return this.http
      .get<any>(`${environment.api}/api/tops/getTopPosts?date=${date}`)
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

  getAdsByType(type: string): Observable<string> {
    return this.http
      .get<any>(`${environment.api}/api/web/getAdsByType?type=${type}`)
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

  getAfiliados(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/web/getAfiliados`)
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

  changeAfiliadoActive(obj: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/web/changeAfiliadoActive`, obj)
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

  hitAfiliado(codigo: string): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/web/hitAfiliado?codigo=${codigo}`)
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

  getHistorialModeracion(): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/web/getHistorialModeracion`)
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
