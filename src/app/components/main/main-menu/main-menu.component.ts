import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent implements OnInit {
  public active: string = '';
  public currentUser: any;

  constructor(
    private securityService: IHttpSecurityService,
    private router: Router
  ) {
    this.currentUser = this.securityService.getCurrentUser();

    this.router.events.subscribe((val: any) => {
      if(val?.url) {
        this.active = val?.url;
      }
    });
  }

  ngOnInit(): void {}
}
