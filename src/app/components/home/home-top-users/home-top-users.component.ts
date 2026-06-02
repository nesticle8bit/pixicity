import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TopUserModel } from 'src/app/models/web/topUser.model';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';

@Component({
  standalone: false,
  selector: 'app-home-top-users',
  templateUrl: './home-top-users.component.html',
  styleUrls: ['./home-top-users.component.scss'],
})
export class HomeTopUsersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public topUsers: TopUserModel[] = [];

  constructor(private httpWeb: IHttpWebService) {}

  ngOnInit(): void {
    this.getTopUsers();
  }

  getTopUsers(): void {
    this.httpWeb
      .getTopUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: TopUserModel[]) => {
        this.topUsers = value;
      });
  }
}
