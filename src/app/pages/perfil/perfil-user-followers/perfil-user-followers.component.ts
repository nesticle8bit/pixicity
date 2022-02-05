import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-perfil-user-followers',
  templateUrl: './perfil-user-followers.component.html',
  styleUrls: ['./perfil-user-followers.component.scss']
})
export class PerfilUserFollowersComponent implements OnInit {
  private _usuarioId: any;

  @Input() set usuarioId(value: any) {
    this._usuarioId = value;

    if (value) {
    }
  }

  get usuarioId(): any {
    return this._usuarioId;
  }
  
  constructor() { }

  ngOnInit(): void {
  }

}
