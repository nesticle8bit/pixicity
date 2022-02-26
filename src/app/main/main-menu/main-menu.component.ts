import { Component, OnInit } from '@angular/core';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent implements OnInit {
  public currentUser: any;

  constructor(private securityService: IHttpSecurityService) {
    this.currentUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {}
}
