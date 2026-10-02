import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  standalone: false,
  // Solo depende de sus @Input: se vuelve a evaluar únicamente cuando cambian (se usa en cada lista de la app).
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'addon-country-flag',
  templateUrl: './country-flag.component.html',
  styleUrls: ['./country-flag.component.scss'],
})
export class CountryFlagComponent implements OnInit {
  @Input() iso2: string = '';
  @Input() title: string = '';

  constructor() {}

  ngOnInit(): void {}
}
