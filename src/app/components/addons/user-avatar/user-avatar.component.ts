import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,
  // Solo depende de sus @Input: se vuelve a evaluar únicamente cuando cambian (se usa en cada lista de la app).
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
})
export class UserAvatarComponent implements OnInit {
  public backendURL: string = `${environment.api}/images/avatars`;

  @Input() height: number | string | null = null;
  @Input() width: number | string | null = null;
  @Input() class: string = '';

  private _avatar: string | null | undefined;

  @Input() set avatar(value: string | null | undefined) {
    this._avatar = value;
  }

  get avatar(): string {
    return this._avatar ? this._avatar : '';
  }

  private _userName: string | null | undefined;

  @Input() set userName(value: string | null | undefined) {
    this._userName = value;
  }

  get userName(): string {
    return this._userName ? this._userName : '';
  }

  get imageURL(): string {
    return this.userName && this.avatar ? `${this.backendURL}/${this.userName}/${this.avatar}` : '/assets/images/avatar.png';
  }

  constructor() {}

  ngOnInit(): void {}
}
