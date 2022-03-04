import { Component, OnInit } from '@angular/core';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-home-last-registered-users',
  templateUrl: './home-last-registered-users.component.html',
  styleUrls: ['./home-last-registered-users.component.scss']
})
export class HomeLastRegisteredUsersComponent implements OnInit {
  public users: any[] = [];

  constructor(
    private securityService: IHttpSecurityService
  ) { }

  ngOnInit(): void {
    this.getLastRegisteredUsers();
  }

  getLastRegisteredUsers(): void {
    this.securityService.getLastRegisteredUsers().subscribe((response: any) => {
      this.users = response;
    });
  }
}
