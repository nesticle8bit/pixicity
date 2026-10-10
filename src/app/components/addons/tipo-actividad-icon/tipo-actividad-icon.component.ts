import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';

@Component({
    selector: 'addons-tipo-actividad-icon',
    // Solo depende de sus inputs: se vuelve a evaluar únicamente cuando cambian.
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './tipo-actividad-icon.component.html',
    styleUrls: ['./tipo-actividad-icon.component.scss'],
})
export class TipoActividadIconComponent implements OnInit {
  readonly tipoActividad = input<number | null | undefined>(undefined);

  readonly class = input<string>('');

  constructor() {}

  ngOnInit(): void {}
}
