import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-profile-shouts-wall',
  templateUrl: './profile-shouts-wall.component.html',
  styleUrls: ['./profile-shouts-wall.component.scss']
})
export class ProfileShoutsWallComponent implements OnInit {
  private _user: any;

  @Input() set user(value: any) {
    this._user = value;

    if (value && value.id) {
      this.getShouts();
    }
  }

  get user(): any {
    return this._user;
  }
  
  public shoutsList: any[] = [];
  public totalCount: number = 0;
  
  constructor(
    private perfilService: IHttpPerfilService,
    public paginationService: PaginationService) {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
  }

  ngOnInit(): void {
    
  }

  getShouts(): void {
    this.perfilService.getShouts(this.user.id).subscribe((response: any) => {
      this.shoutsList = response.shouts;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getShouts();
  }

}
