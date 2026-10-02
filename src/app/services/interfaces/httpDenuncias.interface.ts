import { DenunciaViewModel } from 'src/app/models/shared/service-types.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedData } from 'src/app/models/api/api-response.model';

@Injectable()
export abstract class IHttpDenunciasService {
  abstract getDenuncias(): Observable<PaginatedData<DenunciaViewModel>>;
  abstract getDenunciasCount(): Observable<number>;
  abstract deleteDenuncia(denunciaId: number): Observable<boolean>;
}
