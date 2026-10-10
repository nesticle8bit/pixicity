import { DisplayComponentModel } from 'src/app/models/shared/displayComponent.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DisplayComponentService {
  // Con valor inicial (el de la mayoría de las páginas): con un Subject el submenú no existía hasta que la página
  // llamaba a setDisplay (después de cargar su chunk) y al aparecer empujaba todo el contenido hacia abajo (CLS).
  // Además, quien se suscribe tarde recibe el último estado en vez de quedarse sin él.
  private display = new BehaviorSubject<DisplayComponentModel>({
    mainMenu: true,
    footer: true,
    searchFooter: true,
    submenu: true,
    background: '',
  });

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
