import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpDenunciasService {
  abstract getDenuncias(): Observable<any>;
  abstract deleteDenuncia(denunciaId: number): Observable<any>;
}
