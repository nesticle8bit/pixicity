import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor(private toastr: ToastrService) {}

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
    if (httpError.error instanceof ErrorEvent) {
      if (httpError?.error?.message) {
        this.toastr.error(
          `An error occurred ${httpError?.error?.message}`,
          'Error'
        );
        console.error('An error occurred:', httpError?.error?.message);
      }
    } else {
      if (httpError?.message) {
        console.error(httpError);
        this.toastr.error(
          `Un error se ha encontrado: ${httpError?.status}, ` +
            `Contenido: ${httpError?.message}`,
          'Error'
        );
      }
    }

    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  };

  scrollToTop = () => {
    (function smoothscroll() {
      let currentScroll =
        document.documentElement.scrollTop || document.body.scrollTop;

      if (currentScroll > 0) {
        window.requestAnimationFrame(smoothscroll);
        window.scrollTo(0, currentScroll - currentScroll / 8);
      }
    })();
  };
}
