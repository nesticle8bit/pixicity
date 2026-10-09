import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    // Solo depende de sus @Input: se vuelve a evaluar únicamente cuando cambian (se usa en cada lista de la app).
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-tipo-icon-monitor',
    templateUrl: './tipo-icon-monitor.component.html',
    styleUrls: ['./tipo-icon-monitor.component.scss'],
    imports: [NgClass],
})
export class TipoIconMonitorComponent implements OnInit {
  private _tipo: any;

  @Input() set tipo(value: any) {
    this._tipo = value;
  }

  get tipo(): any {
    return this._tipo;
  }

  constructor() {}

  ngOnInit(): void {}
}
