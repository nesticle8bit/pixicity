import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor(
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  generateObjectId = (): string => {
    const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);

    return (
      timestamp +
      'xxxxxxxxxxxxxxxx'
        .replace(/[x]/g, () => {
          return ((Math.random() * 16) | 0).toString(16);
        })
        .toLowerCase()
    );
  };

  errorHandler = (httpError: HttpErrorResponse) => {
    console.error(httpError);
    return throwError('Something bad happened; please try again later.');
  };

  scrollToTop = () => {
    const platform = this.platformId;

    (function smoothscroll() {
      let currentScroll =
        document.documentElement.scrollTop || document.body.scrollTop;

      if (currentScroll > 0) {
        if (isPlatformBrowser(platform)) {
          window.requestAnimationFrame(smoothscroll);
          window.scrollTo(0, currentScroll - currentScroll / 8);
        }
      }
    })();
  };
}
