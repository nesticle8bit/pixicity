import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogChangeAvatarComponent } from 'src/app/components/dialogs/dialog-change-avatar/dialog-change-avatar.component';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { UsuarioPerfilViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { EstadoViewModel, PaisViewModel } from 'src/app/models/parametros/parametros-vm.model';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { MatTabGroup, MatTab, MatTabLabel } from '@angular/material/tabs';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { SelectAutocompleteComponent } from '../../shared/select-autocomplete/select-autocomplete.component';
import { MatButton } from '@angular/material/button';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription } from '@angular/material/expansion';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';
import { AccountPerfilComponent } from './account-perfil/account-perfil.component';
import { AccountBloqueadosComponent } from './account-bloqueados/account-bloqueados.component';
import { AccountPasswordComponent } from './account-password/account-password.component';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    imports: [
    MatTabGroup,
    MatTab,
    MatTabLabel,
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    SelectAutocompleteComponent,
    MatButton,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    UserAvatarComponent,
    AccountPerfilComponent,
    AccountBloqueadosComponent,
    AccountPasswordComponent,
],
})
export class AccountComponent implements OnInit {
  private securityService = inject(IHttpSecurityService);
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private parametrosService = inject(IHttpParametrosService);
  private formBuilder = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public changeEmailStatus: boolean = false;
  public currentStep: number = 0;
  public paises: PaisViewModel[] = [];
  public estados: EstadoViewModel[] = [];
  public generos: { value: number; label: string }[] = [
    {
      value: 1,
      label: 'Masculino',
    },
    {
      value: 2,
      label: 'Femenino',
    },
    {
      value: 3,
      label: 'Otro',
    },
  ];

  public dias: number[] = [];
  public meses: { label: string; value: string }[] = [
    {
      label: 'Enero',
      value: '01',
    },
    {
      label: 'Febrero',
      value: '02',
    },
    {
      label: 'Marzo',
      value: '03',
    },
    {
      label: 'Abril',
      value: '04',
    },
    {
      label: 'Mayo',
      value: '05',
    },
    {
      label: 'Junio',
      value: '06',
    },
    {
      label: 'Julio',
      value: '07',
    },
    {
      label: 'Agosto',
      value: '08',
    },
    {
      label: 'Septiembre',
      value: '09',
    },
    {
      label: 'Octubre',
      value: '10',
    },
    {
      label: 'Noviembre',
      value: '11',
    },
    {
      label: 'Diciembre',
      value: '12',
    },
  ];
  public years: number[] = [];

  public formGroupCuenta: FormGroup;
  public formGroupPersonalizacion: FormGroup;

  // Perfil extendido: se pide una sola vez aquí (también trae el fondo) y se pasa a <app-account-perfil>.
  public perfilActual: UsuarioPerfilViewModel | null = null;

  constructor() {
    this.formGroupCuenta = this.formBuilder.group({
      avatar: '',
      userName: '',
      email: ['', Validators.email],
      paisId: [undefined, Validators.required],
      estadoId: [undefined, Validators.required],
      genero: [undefined, Validators.required],
      dia: [undefined, Validators.required],
      mes: [undefined, Validators.required],
      año: [undefined, Validators.required],
    });

    this.formGroupPersonalizacion = this.formBuilder.group({
      profileBackground: ''
    });

    this.getCurrentPerfilInfo();
  }

  getCurrentPerfilInfo(): void {
    this.usuarioPerfilService.getCurrentPerfilInfo().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.perfilActual = response.perfil ?? null;
        this.formGroupPersonalizacion.patchValue({
          profileBackground: response.background
        });
      }
    });
  }

  ngOnInit(): void {
    this.getCurrentUser();
    this.getPaises();
    this.initFechas();
  }

  getCurrentUser(): void {
    this.securityService.getLoggedUserByJwt().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        const fechaNacimiento = value.fechaNacimiento?.split('/') ?? [];

        this.formGroupCuenta.patchValue({
          avatar: value.avatar,
          userName: value.userName,
          email: value.email,
          genero: value.genero,
          paisId: value.paisId,
          estadoId: value.estadoId,
          dia: fechaNacimiento[0],
          mes: fechaNacimiento[1],
          año: fechaNacimiento[2],
        });

        if (value?.paisId) {
          this.getEstadosByPais(value.paisId);
        }
      }
    });
  }

  initFechas(): void {
    for (let index = 0; index < 31; index++) {
      this.dias.push(index + 1);
    }

    for (let index = new Date().getFullYear() - 1; index > 1919; index--) {
      this.years.push(index);
    }
  }

  getPaises(): void {
    this.parametrosService.getPaisesDropdown().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values) => {
      this.paises = values;
    });
  }

  /** El usuario eligió otro país: el estado anterior pertenece al país viejo, así que se vacía. */
  cambiarPais(paisId: number | null | undefined): void {
    this.formGroupCuenta.patchValue({ estadoId: null });
    this.estados = [];
    this.getEstadosByPais(paisId);
  }

  getEstadosByPais(paisId: number | null | undefined): void {
    if (!paisId) {
      return;
    }

    this.parametrosService.getEstadosByPais(paisId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values) => {
      this.estados = values;
    });
  }

  changeEmail(): void {
    this.changeEmailStatus = !this.changeEmailStatus;
  }

  updateUsuario(): void {
    const cuenta = Object.assign({}, this.formGroupCuenta.value);
    cuenta.fechaNacimiento = `${cuenta.dia}/${cuenta.mes}/${cuenta.año}`;

    this.securityService.updateUsuario(cuenta).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.notificationService.success('La información de la cuenta ha sido actualizado correctamente', 'Actualizado');
      }
    });
  }

  changeAvatar(): void {
    const dialogRef = this.dialog.open(DialogChangeAvatarComponent, {
      width: '350px',
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        this.formGroupCuenta.patchValue({
          avatar: value,
        });

        const currentUser = this.securityService.getCurrentUser();
        if (currentUser.usuario) {
          currentUser.usuario.avatar = value;
          this.securityService.setUserToLocalStorage(currentUser);
        }
      }
    });
  }

  saveFormGroupPersonalizacion(): void {
    const personalization = Object.assign({}, this.formGroupPersonalizacion.value);

    this.usuarioPerfilService.changeBackgroundProfile(personalization).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.notificationService.success('El background de tu perfil ha sido actualizado correctamente', 'Actualizado');
    });
  }
}
