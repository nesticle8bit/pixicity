import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  standalone: false,
  selector: 'app-change-avatar',
  templateUrl: './change-avatar.component.html',
  styleUrls: ['./change-avatar.component.scss'],
})
export class ChangeAvatarComponent implements OnInit {
  public currentUser?: JwtUserModel;
  @Input() data: any;

  constructor(
    private dialog: MatDialog,
    private securityService: IHttpSecurityService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  async changeAvatar(): Promise<void> {
    // El cropper (ngx-image-cropper) se carga solo cuando se abre el dialogo.
    const { DialogChangeAvatarComponent } = await import(
      'src/app/components/dialogs/dialog-change-avatar/dialog-change-avatar.component'
    );

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
