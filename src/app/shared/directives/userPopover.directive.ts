import { ComponentRef, Directive, ElementRef, HostListener, OnDestroy, ViewContainerRef, input, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { forkJoin } from 'rxjs';
import { UsuarioInfoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { UserPopoverCardComponent } from 'src/app/components/addons/user-popover-card/user-popover-card.component';
import { IHttpUsuarioPerfilService } from '../../services/interfaces/httpUsuarioPerfil.interface';

// Shared cache across all directive instances
const USER_CACHE = new Map<string, { userData: UsuarioInfoViewModel; activo: number | null }>();
const PENDING = new Set<string>();

@Directive({ selector: '[appUserPopover]' })
export class UserPopoverDirective implements OnDestroy {
  private el = inject(ElementRef);
  private overlay = inject(Overlay);
  private vcr = inject(ViewContainerRef);
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);

  // Acepta null/undefined (usuarios borrados o datos aún cargando): sin nombre no se abre el popover.
  readonly userName = input<string, string | null | undefined>('', { alias: "appUserPopover", transform: (v: string | null | undefined) => v ?? '' });

  private overlayRef: OverlayRef | null = null;
  private cardRef: ComponentRef<UserPopoverCardComponent> | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

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
    const userName = this.userName();
    if (!userName || this.overlayRef) return;

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

    const cached = USER_CACHE.get(userName);
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
    const userName = this.userName();
    if (PENDING.has(userName)) return;
    PENDING.add(userName);

    forkJoin({
      info: this.usuarioPerfilService.getUsuarioInfo(userName),
      status: this.usuarioPerfilService.getUserStatus(userName),
    }).subscribe({
      next: ({ info, status }) => {
        const entry = { userData: info, activo: status ?? null };
        const userNameValue = this.userName();
        USER_CACHE.set(userNameValue, entry);
        PENDING.delete(userNameValue);

        // Update card if still open
        if (this.cardRef) {
          this.cardRef.setInput('userData', entry.userData);
          this.cardRef.setInput('activo', entry.activo);
          this.cardRef.setInput('loading', false);
        }
      },
      error: () => {
        PENDING.delete(this.userName());
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
