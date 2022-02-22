import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'addon-country-flag',
  templateUrl: './country-flag.component.html',
  styleUrls: ['./country-flag.component.scss'],
})
export class CountryFlagComponent implements OnInit {
  @Input() iso2: string = '';

  constructor() {}

  ngOnInit(): void {}
}
