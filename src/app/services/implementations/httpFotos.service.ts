import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HelperService } from '../shared/helper.service';
import { IHttpFotosService } from '../interfaces/httpFotos.interface';
import { ApiResponse, PaginatedData } from 'src/app/models/api/api-response.model';
import { FotoViewModel, FotoComentarioViewModel } from 'src/app/models/fotos/foto-vm.model';

interface FotoSearchParams {
  page?: number;
  pageCount?: number;
}

@Injectable()
export class HttpFotosService implements IHttpFotosService {
  constructor(
    private http: HttpClient,
    private helper: HelperService
  ) {}

  getFotos(search: FotoSearchParams = {}): Observable<PaginatedData<FotoViewModel>> {
    const page = search?.page || 1;
    const pageCount = search?.pageCount || 12;
    return this.http
      .get<ApiResponse<PaginatedData<FotoViewModel>>>(`${environment.api}/api/fotos/GetFotos?page=${page}&pageCount=${pageCount}`)
      .pipe(
        map((response) => {
          if (response.status === 200) { return response.data!; }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }

  getFotosAdmin(search: FotoSearchParams & { query?: string } = {}): Observable<PaginatedData<FotoViewModel>> {
    const page = search?.page || 1;
    const pageCount = search?.pageCount || 25;
    const query = search?.query || '';
    return this.http
      .get<ApiResponse<PaginatedData<FotoViewModel>>>(`${environment.api}/api/fotos/GetFotosAdmin?page=${page}&pageCount=${pageCount}&query=${query}`)
      .pipe(
        map((response) => {
          if (response.status === 200) { return response.data!; }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }

  getTopFotos(count: number = 5): Observable<FotoViewModel[]> {
    return this.http
      .get<ApiResponse<FotoViewModel[]>>(`${environment.api}/api/fotos/GetTopFotos?count=${count}`)
      .pipe(
        map((response) => (response.status === 200 ? response.data! : [])),
        catchError(this.helper.errorHandler)
      );
  }

  getFotosByUsuario(userName: string, search: FotoSearchParams = {}): Observable<PaginatedData<FotoViewModel>> {
    const page = search?.page || 1;
    const pageCount = search?.pageCount || 12;
    return this.http
      .get<ApiResponse<PaginatedData<FotoViewModel>>>(`${environment.api}/api/fotos/GetFotosByUsuario?userName=${encodeURIComponent(userName)}&page=${page}&pageCount=${pageCount}`)
      .pipe(
        map((response) => {
          if (response.status === 200) { return response.data!; }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }

  getFotoById(fotoId: number): Observable<FotoViewModel> {
    return this.http
      .get<ApiResponse<FotoViewModel>>(`${environment.api}/api/fotos/GetFotoById?id=${fotoId}`)
      .pipe(
        map((response) => {
          if (response.status === 200) { return response.data!; }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }

  saveFoto(foto: Partial<FotoViewModel>): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/fotos/SaveFoto`, foto)
      .pipe(
        map((response) => {
          if (response.status === 200) { return response.data!; }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }

  updateFoto(foto: Partial<FotoViewModel>): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${environment.api}/api/fotos/UpdateFoto`, foto)
      .pipe(
        map((response) => {
          if (response.status === 200) { return response.data!; }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }

  deleteFoto(fotoId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/fotos/DeleteFoto?id=${fotoId}`)
      .pipe(
        map((response) => {
          if (response.status === 200) { return response.data!; }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }

  votarFoto(fotoId: number, cantidad: number): Observable<FotoViewModel> {
    return this.http
      .post<ApiResponse<FotoViewModel>>(`${environment.api}/api/fotos/VotarFoto`, { fotoId, cantidad })
      .pipe(
        map((response) => {
          if (response.status === 200) { return response.data!; }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }

  incrementVisitas(fotoId: number): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${environment.api}/api/fotos/IncrementVisitas`, fotoId)
      .pipe(
        map((response) => {
          if (response.status === 200) { return response.data!; }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiResponse<string>>(`${environment.api}/api/fotos/UploadImage`, formData)
      .pipe(
        map((response) => {
          if (response.status === 200) { return response.data!; }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }

  getComentariosByFotoId(fotoId: number): Observable<FotoComentarioViewModel[]> {
    return this.http
      .get<ApiResponse<FotoComentarioViewModel[]>>(`${environment.api}/api/fotos/GetComentariosByFotoId?fotoId=${fotoId}`)
      .pipe(
        map((response) => (response.status === 200 ? response.data! : [])),
        catchError(this.helper.errorHandler)
      );
  }

  addComentario(comentario: Partial<FotoComentarioViewModel>): Observable<FotoComentarioViewModel> {
    return this.http
      .post<ApiResponse<FotoComentarioViewModel>>(`${environment.api}/api/fotos/AddComentario`, comentario)
      .pipe(
        map((response) => {
          if (response.status === 200) { return response.data!; }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }

  deleteComentario(id: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${environment.api}/api/fotos/DeleteComentario?id=${id}`)
      .pipe(
        map((response) => {
          if (response.status === 200) { return response.data!; }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }

  votarComentario(comentarioId: number, cantidad: number): Observable<FotoComentarioViewModel> {
    return this.http
      .post<ApiResponse<FotoComentarioViewModel>>(`${environment.api}/api/fotos/VotarComentario`, { comentarioId, cantidad })
      .pipe(
        map((response) => {
          if (response.status === 200) { return response.data!; }
          throw new Error(response.errors?.join(', ') ?? 'Error');
        }),
        catchError(this.helper.errorHandler)
      );
  }
}
