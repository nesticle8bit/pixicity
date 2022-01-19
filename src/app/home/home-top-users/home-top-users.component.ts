import { Component, OnInit } from '@angular/core';
import { TopUserModel } from 'src/app/models/web/topUser.model';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';

@Component({
  selector: 'app-home-top-users',
  templateUrl: './home-top-users.component.html',
  styleUrls: ['./home-top-users.component.scss']
})
export class HomeTopUsersComponent implements OnInit {
  public topUsers: TopUserModel[] = [];

  constructor(
    private httpWeb: IHttpWebService
  ) { }

  ngOnInit(): void {
    this.getTopUsers();
  }

  getTopUsers(): void {
    this.httpWeb.getTopUsers().subscribe((value: TopUserModel[]) => {
      this.topUsers = value;
    })
  }

}
