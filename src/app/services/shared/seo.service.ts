import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SEOModel } from 'src/app/models/shared/seo.model';

@Injectable({ providedIn: 'root' })
export class SEOService {
  private SEO = new Subject<SEOModel>();

  constructor() {}

  setSEO(display: SEOModel): void {
    this.SEO.next(display);
  }

  clearSEO(): void {
    this.SEO.next({
      title: '',
      description: '',
      tags: [],
      type: '',
      imageURL: '',
    });
  }

  getSEO(): Observable<SEOModel> {
    return this.SEO.asObservable();
  }
}
