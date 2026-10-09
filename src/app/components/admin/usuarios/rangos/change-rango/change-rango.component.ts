import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { DialogChangeRangosComponent } from 'src/app/components/dialogs/dialog-change-rangos/dialog-change-rangos.component';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { Component, OnInit, input, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-change-rango',
    templateUrl: './change-rango.component.html',
    styleUrls: ['./change-rango.component.scss'],
})
export class ChangeRangoComponent implements OnInit {
  private dialog = inject(MatDialog);
  private securityService = inject(IHttpSecurityService);

  public currentUser?: JwtUserModel;
  readonly data = input<any>();

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  changeRango(): void {
    this.dialog.open(DialogChangeRangosComponent, {
      width: '350px',
      data: this.data(),
      disableClose: true,
    });
  }
}
