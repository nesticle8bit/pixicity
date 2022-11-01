import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class IHttpPerfilService {
  abstract getShouts(userId: number): Observable<any>;
  abstract getShoutsAdmin(): Observable<any>;
  abstract createShout(shout: any): Observable<any>;
  abstract deleteShout(shoutId: number): Observable<any>;
  abstract recoveryShout(shoutId: number): Observable<any>;
  abstract getShoutById(shoutId: number): Observable<any>;
}
