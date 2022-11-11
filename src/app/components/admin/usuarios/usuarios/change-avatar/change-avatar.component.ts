import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogChangeAvatarComponent } from 'src/app/components/dialogs/dialog-change-avatar/dialog-change-avatar.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-change-avatar',
  templateUrl: './change-avatar.component.html',
  styleUrls: ['./change-avatar.component.scss'],
})
export class ChangeAvatarComponent implements OnInit {
  public currentUser: any;
  @Input() data: any;

  constructor(
    private dialog: MatDialog,
    private securityService: IHttpSecurityService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  changeAvatar(): void {
    this.dialog.open(DialogChangeAvatarComponent, {
      width: '350px',
      disableClose: true,
      data: {
        isAdmin: true,
        usuario: {
          id: this.data?.id,
          userName: this.data?.userName,
        },
      },
    });
  }
}
