import { MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, OnInit, inject } from '@angular/core';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatTooltip } from '@angular/material/tooltip';
import { NgStyle } from '@angular/common';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-rangos-changes-report',
    templateUrl: './dialog-rangos-changes-report.component.html',
    styleUrls: ['./dialog-rangos-changes-report.component.scss'],
    imports: [
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        MatTooltip,
        NgStyle,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class DialogRangosChangesReportComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);


  ngOnInit(): void {}
}
