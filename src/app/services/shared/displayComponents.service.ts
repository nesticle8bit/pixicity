import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DisplayComponentService {
  private display = new Subject<DisplayComponentModel>();

  constructor() {}

  setDisplay(display: DisplayComponentModel): void {
    this.display.next(display);
  }

  clearDisplay(): void {
    this.display.next({
      mainMenu: false,
      footer: false,
      searchFooter: false,
      submenu: false,
      background: '',
    });
  }

  getDisplay(): Observable<DisplayComponentModel> {
    return this.display.asObservable();
  }
}
