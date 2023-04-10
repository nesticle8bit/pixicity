import { Component, Input, OnInit } from '@angular/core';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-post-original-poster-info',
  templateUrl: './post-original-poster-info.component.html',
  styleUrls: ['./post-original-poster-info.component.scss'],
})
export class PostOriginalPosterInfoComponent implements OnInit {
  private _userName: any;

  @Input() set userName(value: any) {
    this._userName = value;

    if (value) {
      this.getUsuarioInfo(value);
    }
  }

  get userName(): any {
    return this._userName;
  }

  public info: any;
  public currentUser: any;

  constructor(private securityService: IHttpSecurityService) {}

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  getUsuarioInfo(userName: string): void {
    if (!userName) {
      return;
    }

    this.securityService.getUsuarioInfo(userName).subscribe((response: any) => {
      if (response) {
        this.info = response;
      }
    });
  }

  changeSeguidores(value: boolean): void {
    if (this.info) {
      if (!this.info.seguidores) {
        this.info.seguidores = 0;
      }

      if (value) {
        this.info.seguidores += 1;
      } else {
        this.info.seguidores -= 1;
      }
    }
  }
}
