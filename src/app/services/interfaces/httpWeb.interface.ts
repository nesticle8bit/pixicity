import { TopUserModel } from 'src/app/models/web/topUser.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TopPostModel } from 'src/app/models/web/topPost.model';

@Injectable()
export abstract class IHttpWebService {
  abstract getTopUsers(): Observable<TopUserModel[]>;
  abstract getTopPosts(date: string): Observable<TopPostModel[]>;
  abstract getAdsByType(type: string): Observable<string>;
}
