import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-perfil-user-medals',
    // Solo depende de sus inputs: se vuelve a evaluar únicamente cuando cambian.
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './perfil-user-medals.component.html',
    styleUrls: ['./perfil-user-medals.component.scss'],
})
export class PerfilUserMedalsComponent implements OnInit {
  private _usuarioId: number | null | undefined;

  @Input() set usuarioId(value: number | null | undefined) {
    this._usuarioId = value;

    if (value) {
    }
  }

  get usuarioId(): number | null | undefined {
    return this._usuarioId;
  }
  
  constructor() {}

  ngOnInit(): void {}
}
