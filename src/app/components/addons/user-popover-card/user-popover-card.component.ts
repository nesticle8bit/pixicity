import { Component, Input, OnChanges } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-user-popover-card',
  templateUrl: './user-popover-card.component.html',
  styleUrls: ['./user-popover-card.component.scss'],
})
export class UserPopoverCardComponent implements OnChanges {
  @Input() userData: any = null;
  @Input() activo: number | null = null;
  @Input() loading: boolean = true;

  public isOnline: boolean = false;

  ngOnChanges(): void {
    this.isOnline =
      this.activo !== null && this.activo !== undefined && this.activo <= 15;
  }

  get memberSince(): string {
    if (!this.userData?.fechaRegistro) return '';

    const d = new Date(this.userData.fechaRegistro);
    return d.toLocaleDateString('es', { year: 'numeric', month: 'short' });
  }
}
