import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public usuarios: any = [];
  public generos: any[] = [
    { label: 'Hombre', value: 1 },
    { label: 'Mujer', value: 2 },
    { label: 'Otro', value: 3 },
    { label: 'Todos', value: undefined },
  ];

  public paises: any[] = [];
  public rangos: any[] = [];
  public totalCount: number = 0;
  public enLineaValues: any[] = ['En línea', 'Con todo'];

  public formGroup: FormGroup;

  constructor(
    private parametrosService: IHttpParametrosService,
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    public paginationService: PaginationService,
    private formBuilder: FormBuilder
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });

    this.formGroup = this.formBuilder.group({
      enLinea: '',
      genero: '',
      pais: '',
      rango: '',
    });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });
  }

  ngOnInit(): void {
    let pageEvent: PageEvent = { pageIndex: 0, pageSize: 12, length: 0 };
    this.pageChange(pageEvent);

    this.getPaises();
    this.getRangos();
  }

  getUsuarios(): void {
    const search = Object.assign({}, this.formGroup.value);

    this.securityService.getUsuarios(search).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.usuarios = response.usuarios;
      this.totalCount = response.pagination.totalCount;
    });
  }

  getPaises(): void {
    this.parametrosService.getPaisesDropdown().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values: any) => {
      this.paises = values;
    });
  }

  getRangos(): void {
    this.securityService.getRangosDropdown().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values: any) => {
      this.rangos = values;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getUsuarios();
  }
}
