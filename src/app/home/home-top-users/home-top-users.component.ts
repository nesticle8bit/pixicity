import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-top-users',
  templateUrl: './home-top-users.component.html',
  styleUrls: ['./home-top-users.component.scss']
})
export class HomeTopUsersComponent implements OnInit {
  public topUsers: any = [];

  constructor() { }

  ngOnInit(): void {
    for (let index = 0; index < 6; index++) {
      this.topUsers.push({
        user: `nesticle${index}bit`
      });
    }
  }

}
