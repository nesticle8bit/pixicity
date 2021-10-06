import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAfiliarseComponent } from 'src/app/components/dialogs/dialog-afiliarse/dialog-afiliarse.component';

@Component({
  selector: 'app-home-afiliados',
  templateUrl: './home-afiliados.component.html',
  styleUrls: ['./home-afiliados.component.scss']
})
export class HomeAfiliadosComponent implements OnInit {

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  afiliarse(): void {
    this.dialog.open(DialogAfiliarseComponent, {
      width: '500px',
      disableClose: true
    });
  }
}
