import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  public usuarios: any = [];
  public generos: string[] = ['Hombre', 'Mujer', 'Otro', 'Todos'];
  public paises: any[] = [];
  public totalCount: number = 0;

  constructor(
    private securityService: IHttpSecurityService,
    private parametrosService: IHttpParametrosService,
    public paginationService: PaginationService
  ) { }

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
