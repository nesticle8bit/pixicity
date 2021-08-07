import { Component, OnInit } from '@angular/core';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  public usuarios: any = [];
  public generos: string[] = ['Hombre', 'Mujer', 'Otro', 'Todos'];
  public paises: any[] = [];

  constructor(
    private securityService: IHttpSecurityService,
    private parametrosService: IHttpParametrosService
  ) { }

  ngOnInit(): void {
    this.securityService.getUsuarios().subscribe((value: any) => {
      this.usuarios = value.usuarios;
    });

    this.getPaises();
  }

  getPaises(): void {
    this.parametrosService.getPaisesDropdown().subscribe((values: any) => {
      this.paises = values;
    });
  }

}
