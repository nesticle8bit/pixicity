import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpNoticiasService {
  abstract getNoticias(search: string): Observable<any>;
  abstract getAllNoticias(): Observable<any>;
}
