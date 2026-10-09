import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { SelectAutocompleteComponent } from '../../shared/select-autocomplete/select-autocomplete.component';
import { SelectOptionDirective, SelectLabelDirective } from '../../shared/select-autocomplete/select-template.directives';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { IHttpRangosService } from '../../../services/interfaces/httpRangos.interface';

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.scss'],
    imports: [
        RouterLink,
        UserPopoverDirective,
        MatTooltip,
        NgClass,
        UserAvatarComponent,
        MatPaginator,
        FormsModule,
        ReactiveFormsModule,
        MatRadioGroup,
        MatRadioButton,
        SelectAutocompleteComponent,
        SelectOptionDirective,
        SelectLabelDirective,
        MatButton,
        MatIcon,
    ],
})
export class UsuariosComponent implements OnInit {
  private parametrosService = inject(IHttpParametrosService);
  private displayService = inject(DisplayComponentService);
  private securityService = inject(IHttpSecurityService);
  private rangosService = inject(IHttpRangosService);
  paginationService = inject(PaginationService);
  private formBuilder = inject(FormBuilder);

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

  constructor() {
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

    this.securityService.getUsuarios(search).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.usuarios = response.usuarios;
      this.totalCount = response.pagination.totalCount;
    });
  }

  getPaises(): void {
    this.parametrosService.getPaisesDropdown().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values) => {
      this.paises = values;
    });
  }

  getRangos(): void {
    this.rangosService.getRangosDropdown().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values) => {
      this.rangos = values;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getUsuarios();
  }
}
