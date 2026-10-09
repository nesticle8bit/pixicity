import { Component, Input, OnInit, input } from '@angular/core';

@Component({
    selector: 'addons-tipo-actividad-icon',
    templateUrl: './tipo-actividad-icon.component.html',
    styleUrls: ['./tipo-actividad-icon.component.scss'],
})
export class TipoActividadIconComponent implements OnInit {
  private _tipoActividad: any;

  @Input() set tipoActividad(value: any) {
    this._tipoActividad = value;
  }

  get tipoActividad(): any {
    return this._tipoActividad;
  }

  readonly class = input<string>('');

  constructor() {}

  ngOnInit(): void {}
}
