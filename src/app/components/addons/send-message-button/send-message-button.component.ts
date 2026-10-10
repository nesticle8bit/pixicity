import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { Component, OnInit, input, inject } from '@angular/core';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DialogEnviarMPComponent } from '../../dialogs/dialog-enviar-mp/dialog-enviar-mp.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-send-message-button',
    templateUrl: './send-message-button.component.html',
    styleUrls: ['./send-message-button.component.scss'],
})
export class SendMessageButtonComponent implements OnInit {
  private securityService = inject(IHttpSecurityService);
  private dialog = inject(MatDialog);

  readonly icon = input<boolean>(false);

  readonly userName = input<string | null | undefined>(undefined);

  public currentUser?: JwtUserModel;
  constructor() {
    this.currentUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {}

  enviarMP(): void {
    this.dialog.open(DialogEnviarMPComponent, {
      width: '780px',
      disableClose: true,
      data: {
        userName: this.userName(),
      },
    });
  }
}
