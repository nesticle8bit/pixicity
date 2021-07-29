import { Component, OnInit } from '@angular/core';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-section-user-info-login',
  templateUrl: './section-user-info-login.component.html',
  styleUrls: ['./section-user-info-login.component.scss']
})
export class SectionUserInfoLoginComponent implements OnInit {
  public currentUser: JwtUserModel;

  constructor(
    private securityService: IHttpSecurityService
  ) {
    this.currentUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {
  }

}
