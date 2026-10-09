import { ChangeDetectionStrategy, Component, Input, OnInit, input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NgStyle } from '@angular/common';
import { ThumbPipe } from '../../../shared/pipes/thumb.pipe';

@Component({
    // Solo depende de sus @Input: se vuelve a evaluar únicamente cuando cambian (se usa en cada lista de la app).
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-user-avatar',
    templateUrl: './user-avatar.component.html',
    styleUrls: ['./user-avatar.component.scss'],
    imports: [ThumbPipe, NgStyle],
})
export class UserAvatarComponent implements OnInit {
  public backendURL: string = `${environment.api}/images/avatars`;

  readonly height = input<number | string | null>(null);
  readonly width = input<number | string | null>(null);
  readonly class = input<string>('');

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

  /** Tamaño mostrado (para pedir la miniatura adecuada); sin tamaño explícito se asume un avatar de lista. */
  get avatarAncho(): number {
    const lado = Math.max(Number(this.width()) || 0, Number(this.height()) || 0);
    return lado || 64;
  }

  get imageURL(): string {
    return this.userName && this.avatar ? `${this.backendURL}/${this.userName}/${this.avatar}` : '/assets/images/avatar.png';
  }

  constructor() {}

  ngOnInit(): void {}
}
