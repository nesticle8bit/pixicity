import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { PortadaService } from 'src/app/services/shared/portada.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { CountryFlagComponent } from '../../addons/country-flag/country-flag.component';
import { GenreIconComponent } from '../../addons/genre-icon/genre-icon.component';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

/** Sin realtime (consumía bastante): la lista se actualiza al recargar el home. */
@Component({
    selector: 'app-home-last-registered-users',
    templateUrl: './home-last-registered-users.component.html',
    styleUrls: ['./home-last-registered-users.component.scss'],
    imports: [RouterLink, UserPopoverDirective, CountryFlagComponent, GenreIconComponent, TimeAgoPipe]
})
export class HomeLastRegisteredUsersComponent implements OnInit {
  private securityService = inject(IHttpSecurityService);

  private readonly destroyRef = inject(DestroyRef);
  private portada = inject(PortadaService);

  public users: any[] = [];

  ngOnInit(): void {
    this.getLastRegisteredUsers();
  }

  getLastRegisteredUsers(): void {
    this.portada
      .tomar('usuariosRecientes', this.securityService.getLastRegisteredUsers())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.users = response;
      });
  }
}
