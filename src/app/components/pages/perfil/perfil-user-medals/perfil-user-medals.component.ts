import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-perfil-user-medals',
  templateUrl: './perfil-user-medals.component.html',
  styleUrls: ['./perfil-user-medals.component.scss'],
})
export class PerfilUserMedalsComponent implements OnInit {
  private _usuarioId: any;

  @Input() set usuarioId(value: any) {
    this._usuarioId = value;

    if (value) {
    }
  }

  get usuarioId(): any {
    return this._usuarioId;
  }
  
  constructor() {}

  ngOnInit(): void {}
}
