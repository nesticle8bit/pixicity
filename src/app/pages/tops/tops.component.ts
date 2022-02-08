import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tops',
  templateUrl: './tops.component.html',
  styleUrls: ['./tops.component.scss'],
})
export class TopsComponent implements OnInit {
  public categorias: any[] = [];

  constructor() {}

  ngOnInit(): void {}
}
