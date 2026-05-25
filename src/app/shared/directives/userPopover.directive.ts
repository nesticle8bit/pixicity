import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewContainerRef,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { forkJoin } from 'rxjs';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { UserPopoverCardComponent } from 'src/app/components/addons/user-popover-card/user-popover-card.component';

// Shared cache across all directive instances
const USER_CACHE = new Map<string, { userData: any; activo: number | null }>();
const PENDING = new Set<string>();

@Directive({ selector: '[appUserPopover]', standalone: false })
export class UserPopoverDirective implements OnDestroy {
  @Input('appUserPopover') userName: string = '';

  private overlayRef: OverlayRef | null = null;
  private cardRef: ComponentRef<UserPopoverCardComponent> | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private el: ElementRef,
    private overlay: Overlay,
    private vcr: ViewContainerRef,
    private securityService: IHttpSecurityService
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.showTimer = setTimeout(() => this.show(), 280);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.showTimer) clearTimeout(this.showTimer);
    this.hideTimer = setTimeout(() => this.hide(), 220);
  }

  private show(): void {
    if (!this.userName || this.overlayRef) return;

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.el)
        .withPositions([
          // Below, aligned left
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: 6,
          },
          // Above, aligned left
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
            offsetY: -6,
          },
          // Below, aligned right
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top',
            offsetY: 6,
          },
        ])
        .withPush(true),
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: false,
      panelClass: 'user-popover-panel',
    });

    const portal = new ComponentPortal(UserPopoverCardComponent, this.vcr);
    this.cardRef = this.overlayRef.attach(portal);

    const cached = USER_CACHE.get(this.userName);
    if (cached) {
      this.cardRef.setInput('userData', cached.userData);
      this.cardRef.setInput('activo', cached.activo);
      this.cardRef.setInput('loading', false);
    } else {
      this.cardRef.setInput('loading', true);
      this.loadUserData();
    }

    // Allow mouse to enter the card without closing
    const overlayEl = this.overlayRef.overlayElement;
    overlayEl.addEventListener('mouseenter', () => {
      if (this.hideTimer) clearTimeout(this.hideTimer);
    });
    overlayEl.addEventListener('mouseleave', () => {
      this.hideTimer = setTimeout(() => this.hide(), 200);
    });
  }

  private hide(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.cardRef = null;
    }
  }

  private loadUserData(): void {
    if (PENDING.has(this.userName)) return;
    PENDING.add(this.userName);

    forkJoin({
      info: this.securityService.getUsuarioInfo(this.userName),
      status: this.securityService.getUserStatus(this.userName),
    }).subscribe({
      next: ({ info, status }: any) => {
        const entry = { userData: info, activo: status ?? null };
        USER_CACHE.set(this.userName, entry);
        PENDING.delete(this.userName);

        // Update card if still open
        if (this.cardRef) {
          this.cardRef.setInput('userData', entry.userData);
          this.cardRef.setInput('activo', entry.activo);
          this.cardRef.setInput('loading', false);
        }
      },
      error: () => {
        PENDING.delete(this.userName);
        if (this.cardRef) {
          this.cardRef.setInput('userData', null);
          this.cardRef.setInput('loading', false);
        }
      },
    });
  }

  ngOnDestroy(): void {
    if (this.showTimer) clearTimeout(this.showTimer);
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hide();
  }
}
