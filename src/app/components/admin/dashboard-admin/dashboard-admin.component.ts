import { Component, OnInit } from '@angular/core';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss'],
})
export class DashboardAdminComponent implements OnInit {
  public currentUser: any;
  constructor(private securityService: IHttpSecurityService) {}

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }
}
