import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-shouts-comments',
  templateUrl: './shouts-comments.component.html',
  styleUrls: ['./shouts-comments.component.scss'],
})
export class ShoutsCommentsComponent implements OnInit {
  private _shout: any;

  @Input() set shout(value: any) {
    this._shout = value;
  }

  get shout(): any {
    return this._shout;
  }

  constructor() {}

  ngOnInit(): void {}
}
