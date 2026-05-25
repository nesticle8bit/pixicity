import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HelperService } from '../shared/helper.service';
import { IHttpFotosService } from '../interfaces/httpFotos.interface';

@Injectable()
export class HttpFotosService implements IHttpFotosService {
  constructor(
    private http: HttpClient,
    private helper: HelperService
  ) {}

  getFotos(search: any = {}): Observable<any> {
    const page = search?.page || 1;
    const pageCount = search?.pageCount || 12;
    return this.http
      .get<any>(`${environment.api}/api/fotos/GetFotos?page=${page}&pageCount=${pageCount}`)
      .pipe(
        map((response: any) => (response.status === 200 ? response.data : null)),
        catchError(this.helper.errorHandler)
      );
  }

  getFotosByUsuario(userName: string, search: any = {}): Observable<any> {
    const page = search?.page || 1;
    const pageCount = search?.pageCount || 12;
    return this.http
      .get<any>(`${environment.api}/api/fotos/GetFotosByUsuario?userName=${encodeURIComponent(userName)}&page=${page}&pageCount=${pageCount}`)
      .pipe(
        map((response: any) => (response.status === 200 ? response.data : null)),
        catchError(this.helper.errorHandler)
      );
  }

  getFotoById(fotoId: number): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/fotos/GetFotoById?id=${fotoId}`)
      .pipe(
        map((response: any) => (response.status === 200 ? response.data : null)),
        catchError(this.helper.errorHandler)
      );
  }

  saveFoto(foto: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/fotos/SaveFoto`, foto)
      .pipe(
        map((response: any) => (response.status === 200 ? response.data : null)),
        catchError(this.helper.errorHandler)
      );
  }

  updateFoto(foto: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/fotos/UpdateFoto`, foto)
      .pipe(
        map((response: any) => (response.status === 200 ? response.data : null)),
        catchError(this.helper.errorHandler)
      );
  }

  deleteFoto(fotoId: number): Observable<any> {
    return this.http
      .delete<any>(`${environment.api}/api/fotos/DeleteFoto?id=${fotoId}`)
      .pipe(
        map((response: any) => (response.status === 200 ? response.data : null)),
        catchError(this.helper.errorHandler)
      );
  }

  votarFoto(fotoId: number, cantidad: number): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/fotos/VotarFoto`, { fotoId, cantidad })
      .pipe(
        map((response: any) => (response.status === 200 ? response.data : null)),
        catchError(this.helper.errorHandler)
      );
  }

  incrementVisitas(fotoId: number): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/fotos/IncrementVisitas`, fotoId)
      .pipe(
        map((response: any) => (response.status === 200 ? response.data : null)),
        catchError(this.helper.errorHandler)
      );
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<any>(`${environment.api}/api/fotos/UploadImage`, formData)
      .pipe(
        map((response: any) => (response.status === 200 ? response.data : null)),
        catchError(this.helper.errorHandler)
      );
  }

  getComentariosByFotoId(fotoId: number): Observable<any> {
    return this.http
      .get<any>(`${environment.api}/api/fotos/GetComentariosByFotoId?fotoId=${fotoId}`)
      .pipe(
        map((response: any) => (response.status === 200 ? response.data : [])),
        catchError(this.helper.errorHandler)
      );
  }

  addComentario(comentario: any): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/fotos/AddComentario`, comentario)
      .pipe(
        map((response: any) => (response.status === 200 ? response.data : null)),
        catchError(this.helper.errorHandler)
      );
  }

  deleteComentario(id: number): Observable<any> {
    return this.http
      .delete<any>(`${environment.api}/api/fotos/DeleteComentario?id=${id}`)
      .pipe(
        map((response: any) => (response.status === 200 ? response.data : null)),
        catchError(this.helper.errorHandler)
      );
  }

  votarComentario(comentarioId: number, cantidad: number): Observable<any> {
    return this.http
      .post<any>(`${environment.api}/api/fotos/VotarComentario`, { comentarioId, cantidad })
      .pipe(
        map((response: any) => (response.status === 200 ? response.data : null)),
        catchError(this.helper.errorHandler)
      );
  }
}
