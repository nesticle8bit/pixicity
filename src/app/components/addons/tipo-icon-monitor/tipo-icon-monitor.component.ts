import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
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
  readonly tipo = input<string | null | undefined>(undefined);

  constructor() {}

  ngOnInit(): void {}
}
