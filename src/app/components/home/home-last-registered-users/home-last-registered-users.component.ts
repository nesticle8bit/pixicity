import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  standalone: false,
  selector: 'app-home-last-registered-users',
  templateUrl: './home-last-registered-users.component.html',
  styleUrls: ['./home-last-registered-users.component.scss']
})
export class HomeLastRegisteredUsersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public users: any[] = [];

  constructor(
    private securityService: IHttpSecurityService
  ) { }

  ngOnInit(): void {
    this.getLastRegisteredUsers();
  }

  getLastRegisteredUsers(): void {
    this.securityService
      .getLastRegisteredUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        this.users = response;
      });
  }
}
