import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  standalone: false,
  selector: 'app-user-online-status',
  templateUrl: './user-online-status.component.html',
  styleUrls: ['./user-online-status.component.scss'],
})
export class UserOnlineStatusComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  private _userName: any;

  @Input() set userName(value: any) {
    this._userName = value;

    if (value) {
      this.getUserStatus(value);
    }
  }

  get userName(): any {
    return this._userName ? this._userName : '';
  }

  @Input() class: string = '';

  public activo: number = 0;

  constructor(private securityService: IHttpSecurityService) {}

  ngOnInit(): void {}

  getUserStatus(userName: string): void {
    this.securityService.getUserStatus(userName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.activo = response;
    });
  }
}
