import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { CountryFlagComponent } from '../../addons/country-flag/country-flag.component';
import { GenreIconComponent } from '../../addons/genre-icon/genre-icon.component';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-home-last-registered-users',
    templateUrl: './home-last-registered-users.component.html',
    styleUrls: ['./home-last-registered-users.component.scss'],
    imports: [RouterLink, UserPopoverDirective, CountryFlagComponent, GenreIconComponent, TimeAgoPipe]
})
export class HomeLastRegisteredUsersComponent implements OnInit, OnDestroy {
  private securityService = inject(IHttpSecurityService);
  private signalrService = inject(SignalrService);

  private readonly destroyRef = inject(DestroyRef);

  public users: any[] = [];

  ngOnInit(): void {
    this.getLastRegisteredUsers();

    this.signalrService.homeActualizado$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ lista, v }) => {
      if (lista === 'usuarios') this.getLastRegisteredUsers(v);
    });
    this.signalrService.startHome();
  }

  ngOnDestroy(): void {
    this.signalrService.stopHome();
  }

  getLastRegisteredUsers(version?: number): void {
    this.securityService
      .getLastRegisteredUsers(version)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.users = response;
      });
  }
}
