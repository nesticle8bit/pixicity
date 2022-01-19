import { TopUserModel } from 'src/app/models/web/topUser.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpWebService {
  abstract getTopUsers(): Observable<TopUserModel[]>;
}
