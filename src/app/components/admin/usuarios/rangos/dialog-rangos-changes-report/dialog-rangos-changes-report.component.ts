import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog-rangos-changes-report',
  templateUrl: './dialog-rangos-changes-report.component.html',
  styleUrls: ['./dialog-rangos-changes-report.component.scss'],
})
export class DialogRangosChangesReportComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {}
}
