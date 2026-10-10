import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    // Solo depende de sus @Input: se vuelve a evaluar únicamente cuando cambian (se usa en cada lista de la app).
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'addon-country-flag',
    templateUrl: './country-flag.component.html',
    styleUrls: ['./country-flag.component.scss'],
    imports: [MatTooltip],
})
export class CountryFlagComponent implements OnInit {
  readonly iso2 = input<string | null | undefined>('');
  readonly title = input<string>('');

  constructor() {}

  ngOnInit(): void {}
}
