import { DialogBanUserComponent } from 'src/app/components/dialogs/dialog-ban-user/dialog-ban-user.component';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-banear-usuario',
  templateUrl: './banear-usuario.component.html',
  styleUrls: ['./banear-usuario.component.scss'],
})
export class BanearUsuarioComponent implements OnInit {
  @Input() data: any;
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  banearUsuario(): void {
    this.dialog.open(DialogBanUserComponent, {
      width: '860px',
      data: this.data,
      disableClose: true,
    });
  }
}
