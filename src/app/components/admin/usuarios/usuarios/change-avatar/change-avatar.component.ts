import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { Component, OnInit, input, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
    selector: 'app-change-avatar',
    templateUrl: './change-avatar.component.html',
    styleUrls: ['./change-avatar.component.scss'],
})
export class ChangeAvatarComponent implements OnInit {
  private dialog = inject(MatDialog);
  private securityService = inject(IHttpSecurityService);

  public currentUser?: JwtUserModel;
  readonly data = input<any>();

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  async changeAvatar(): Promise<void> {
    // El cropper (ngx-image-cropper) se carga solo cuando se abre el dialogo.
    const { DialogChangeAvatarComponent } = await import(
      'src/app/components/dialogs/dialog-change-avatar/dialog-change-avatar.component'
    );

    const data = this.data();
    this.dialog.open(DialogChangeAvatarComponent, {
      width: '350px',
      disableClose: true,
      data: {
        isAdmin: true,
        usuario: {
          id: data?.id,
          userName: data?.userName,
        },
      },
    });
  }
}
