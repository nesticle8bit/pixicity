import { Component, Input, OnChanges, input } from '@angular/core';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { NgClass } from '@angular/common';
import { CountryFlagComponent } from '../country-flag/country-flag.component';
import { RouterLink } from '@angular/router';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
    selector: 'app-user-popover-card',
    templateUrl: './user-popover-card.component.html',
    styleUrls: ['./user-popover-card.component.scss'],
    imports: [
        UserAvatarComponent,
        NgClass,
        CountryFlagComponent,
        RouterLink,
        TruncatePipe,
    ],
})
export class UserPopoverCardComponent implements OnChanges {
  @Input() userData: any = null;
  readonly activo = input<number | null>(null);
  readonly loading = input<boolean>(true);

  public isOnline: boolean = false;

  ngOnChanges(): void {
    const activo = this.activo();
    this.isOnline =
      activo !== null && activo !== undefined && activo <= 15;
  }

  get memberSince(): string {
    if (!this.userData?.fechaRegistro) return '';

    const d = new Date(this.userData.fechaRegistro);
    return d.toLocaleDateString('es', { year: 'numeric', month: 'short' });
  }
}
