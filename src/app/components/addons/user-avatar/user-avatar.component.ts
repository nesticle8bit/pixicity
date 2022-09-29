import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
})
export class UserAvatarComponent implements OnInit {
  public backendURL: string = `${environment.api}/images/avatars`;

  @Input() height: any = null;
  @Input() width: any = null;
  @Input() class: string = '';

  private _avatar: any;

  @Input() set avatar(value: any) {
    this._avatar = value;
  }

  get avatar(): any {
    return this._avatar ? this._avatar : '';
  }

  private _userName: any;

  @Input() set userName(value: any) {
    this._userName = value;
  }

  get userName(): any {
    return this._userName ? this._userName : '';
  }

  get imageURL(): string {
    return this.userName && this.avatar ? `${this.backendURL}/${this.userName}/${this.avatar}` : '/assets/images/avatar.png';
  }

  constructor() {}

  ngOnInit(): void {}
}
