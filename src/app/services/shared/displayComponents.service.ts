import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { DisplayComponentModel } from "src/app/models/shared/displayComponent.model";

@Injectable({ providedIn: 'root' })
export class DisplayComponentService {
    private display = new Subject<DisplayComponentModel>();

    constructor() { }

    setDisplay(display: DisplayComponentModel): void {
        this.display.next(display);
    }

    clearDisplay(): void {
        this.display.next();
    }

    getDisplay(): Observable<any> {
        return this.display.asObservable();
    }
}