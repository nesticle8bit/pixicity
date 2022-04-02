import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent implements OnInit {
  public usuarios: any = [];
  public generos: string[] = ['Hombre', 'Mujer', 'Otro', 'Todos'];
  public paises: any[] = [];
  public totalCount: number = 0;

  public formGroup: FormGroup;

  constructor(
    private parametrosService: IHttpParametrosService,
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    public paginationService: PaginationService,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      enLinea: false,
      conTodo: false,
      genero: '',
      pais: '',
      rango: ''
    });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: ''
    });
  }

  ngOnInit(): void {
    let pageEvent: PageEvent = { pageIndex: 0, pageSize: 12, length: 0 };
    this.pageChange(pageEvent);

    this.getPaises();
  }

  getUsuarios(): void {
    this.securityService.getUsuarios().subscribe((response: any) => {
      this.usuarios = response.usuarios;
      this.totalCount = response.pagination.totalCount;
    });
  }

  getPaises(): void {
    this.parametrosService.getPaisesDropdown().subscribe((values: any) => {
      this.paises = values;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getUsuarios();
  }
}
