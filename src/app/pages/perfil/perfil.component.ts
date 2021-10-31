import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  public currentUser: any = {};
  public currentSelection = 'shouts';

  constructor(
    private activatedRoute: ActivatedRoute,
    private securityService: IHttpSecurityService
  ) {
    this.activatedRoute.paramMap.subscribe((values: any) => {
      this.getUserByUserName(values.get('userName'));
    });
  }

  ngOnInit(): void {}

  getUserByUserName(userName: string): void {
    this.securityService.getUserByUserName(userName).subscribe((value: any) => {
      this.currentUser = value;
    });
  }
}
