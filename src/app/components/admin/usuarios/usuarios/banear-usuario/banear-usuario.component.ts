import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-banear-usuario',
  templateUrl: './banear-usuario.component.html',
  styleUrls: ['./banear-usuario.component.scss'],
})
export class BanearUsuarioComponent implements OnInit {
  @Input() data: any;
  constructor() {}

  ngOnInit(): void {}
}
