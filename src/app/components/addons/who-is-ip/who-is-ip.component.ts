import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-who-is-ip',
  templateUrl: './who-is-ip.component.html',
  styleUrls: ['./who-is-ip.component.scss']
})
export class WhoIsIpComponent implements OnInit {
  private _IP: any;

  @Input() set IP(value: any) {
    this._IP = value;
  }

  get IP(): any {
    return this._IP ? this._IP : '';
  }
  
  constructor() { }

  ngOnInit(): void {
  }

}
