import { Component, Input, OnInit } from '@angular/core';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DialogEnviarMPComponent } from '../../dialogs/dialog-enviar-mp/dialog-enviar-mp.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-send-message-button',
  templateUrl: './send-message-button.component.html',
  styleUrls: ['./send-message-button.component.scss'],
})
export class SendMessageButtonComponent implements OnInit {
  @Input() icon: boolean = false;

  private _userName: any;

  @Input() set userName(value: any) {
    this._userName = value;
  }

  get userName(): any {
    return this._userName;
  }

  public currentUser: any;
  constructor(
    private securityService: IHttpSecurityService,
    private dialog: MatDialog
  ) {
    this.currentUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {}

  enviarMP(): void {
    this.dialog.open(DialogEnviarMPComponent, {
      width: '780px',
      disableClose: true,
      data: {
        userName: this.userName,
      },
    });
  }
}
