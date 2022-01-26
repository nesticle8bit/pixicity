import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-information',
  templateUrl: './profile-information.component.html',
  styleUrls: ['./profile-information.component.scss'],
})
export class ProfileInformationComponent implements OnInit {
  private _user: any;

  @Input() set user(value: any) {
    this._user = value;

    if (value) {
    }
  }

  get user(): any {
    return this._user;
  }

  public userInformation: any = {};

  constructor() {}

  ngOnInit(): void {}
}
