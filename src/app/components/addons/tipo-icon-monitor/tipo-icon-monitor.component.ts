import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tipo-icon-monitor',
  templateUrl: './tipo-icon-monitor.component.html',
  styleUrls: ['./tipo-icon-monitor.component.scss'],
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
