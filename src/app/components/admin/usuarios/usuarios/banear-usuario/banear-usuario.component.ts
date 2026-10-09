import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { DialogBanUserComponent } from 'src/app/components/dialogs/dialog-ban-user/dialog-ban-user.component';
import { Component, OnInit, input, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
    selector: 'app-banear-usuario',
    templateUrl: './banear-usuario.component.html',
    styleUrls: ['./banear-usuario.component.scss'],
})
export class BanearUsuarioComponent implements OnInit {
  private securityService = inject(IHttpSecurityService);
  private dialog = inject(MatDialog);

  public currentUser?: JwtUserModel;
  readonly data = input<any>();

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  banearUsuario(): void {
    this.dialog.open(DialogBanUserComponent, {
      width: '860px',
      data: this.data(),
      disableClose: true,
    });
  }
}
