import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-ver-reporte',
  templateUrl: './dialog-ver-reporte.component.html',
  styleUrls: ['./dialog-ver-reporte.component.scss'],
})
export class DialogVerReporteComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {}
}
