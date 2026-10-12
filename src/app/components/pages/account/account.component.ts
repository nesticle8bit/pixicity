import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogChangeAvatarComponent } from 'src/app/components/dialogs/dialog-change-avatar/dialog-change-avatar.component';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { UsuarioPerfilViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { EstadoViewModel, PaisViewModel } from 'src/app/models/parametros/parametros-vm.model';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { MatIcon } from '@angular/material/icon';
import { SelectAutocompleteComponent } from '../../shared/select-autocomplete/select-autocomplete.component';
import { MatAnchor, MatButton } from '@angular/material/button';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';
import { AccountPerfilComponent } from './account-perfil/account-perfil.component';
import { AccountBloqueadosComponent } from './account-bloqueados/account-bloqueados.component';
import { AccountPasswordComponent } from './account-password/account-password.component';
import { AccountDosFactoresComponent } from './account-dos-factores/account-dos-factores.component';
import { AccountNotificacionesComponent } from './account-notificaciones/account-notificaciones.component';

export type SeccionCuenta = 'datos' | 'perfil' | 'personalizacion' | 'password' | 'dos-factores' | 'bloqueados' | 'notificaciones';

interface Seccion {
  id: SeccionCuenta;
  label: string;
  icono: string;
  descripcion: string;
}

/** Navegación de /cuenta; la sección activa vive en ?seccion= para poder enlazarla directo. */
export const GRUPOS_CUENTA: { nombre: string; secciones: Seccion[] }[] = [
  {
    nombre: 'Cuenta',
    secciones: [
      { id: 'datos', label: 'Datos de la cuenta', icono: 'account_circle', descripcion: 'Correo, ubicación y datos personales.' },
      { id: 'perfil', label: 'Perfil', icono: 'badge', descripcion: 'Lo que otros ven sobre ti en tu perfil público.' },
      { id: 'personalizacion', label: 'Personalización', icono: 'palette', descripcion: 'Dale tu estilo al fondo de tu perfil.' },
    ],
  },
  {
    nombre: 'Seguridad',
    secciones: [
      { id: 'password', label: 'Contraseña', icono: 'password', descripcion: 'Cambia tu contraseña de acceso.' },
      { id: 'dos-factores', label: 'Verificación en dos pasos', icono: 'verified_user', descripcion: 'Protege tu cuenta con un código extra al iniciar sesión.' },
      { id: 'bloqueados', label: 'Usuarios bloqueados', icono: 'block', descripcion: 'Personas que no pueden interactuar contigo.' },
    ],
  },
  {
    nombre: 'Preferencias',
    secciones: [
      { id: 'notificaciones', label: 'Notificaciones', icono: 'notifications', descripcion: 'Elige qué avisos llegan a tu campana.' },
    ],
  },
];

const SECCIONES = GRUPOS_CUENTA.flatMap((g) => g.secciones);
const FONDO_VALIDO = /^https?:\/\/\S+\.(jpe?g|png)(\?\S*)?$/i;

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    imports: [
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    SelectAutocompleteComponent,
    MatButton,
    MatAnchor,
    UserAvatarComponent,
    AccountPerfilComponent,
    AccountBloqueadosComponent,
    AccountPasswordComponent,
    AccountDosFactoresComponent,
    AccountNotificacionesComponent,
],
})
export class AccountComponent implements OnInit {
  private securityService = inject(IHttpSecurityService);
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private parametrosService = inject(IHttpParametrosService);
  private formBuilder = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);

  private readonly destroyRef = inject(DestroyRef);

  public readonly grupos = GRUPOS_CUENTA;
  public readonly seccion = signal<SeccionCuenta>('datos');
  public readonly seccionActual = computed(() => SECCIONES.find((s) => s.id === this.seccion()) ?? SECCIONES[0]);

  public readonly emailActual = signal<string>('');
  public readonly emailConfirmado = signal<boolean | null>(null);
  public readonly reenviando = signal(false);
  public readonly guardando = signal(false);
  private readonly fondo = signal<string>('');
  /** Fondo para la cabecera: solo URLs válidas, sin comillas/paréntesis que rompan el url(). */
  public readonly fondoCss = computed(() => {
    const url = this.fondo().trim();
    return FONDO_VALIDO.test(url) ? `url("${url.replace(/["()\\]/g, '')}")` : '';
  });

  public changeEmailStatus: boolean = false;
  private valoresCuentaOriginales: Record<string, unknown> | null = null;
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
      profileBackground: ['', Validators.pattern(FONDO_VALIDO)],
    });

    this.formGroupPersonalizacion.controls['profileBackground'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v: string | null) => this.fondo.set(v ?? ''));

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('seccion');
      this.seccion.set(SECCIONES.some((s) => s.id === id) ? (id as SeccionCuenta) : 'datos');
    });

    this.getCurrentPerfilInfo();
  }

  getCurrentPerfilInfo(): void {
    this.usuarioPerfilService.getCurrentPerfilInfo().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.perfilActual = response.perfil ?? null;
        this.formGroupPersonalizacion.reset({ profileBackground: response.background ?? '' });
      }
    });
  }

  ngOnInit(): void {
    this.getCurrentUser();
    this.getPaises();
    this.initFechas();
    this.getEstadoEmail();
  }

  getEstadoEmail(): void {
    this.securityService.getEstadoEmail().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((estado) => {
      this.emailActual.set(estado.email);
      this.emailConfirmado.set(estado.emailConfirmado);
      this.securityService.marcarEmailConfirmado(estado.emailConfirmado);
    });
  }

  reenviarConfirmacion(): void {
    this.reenviando.set(true);
    this.securityService.reenviarConfirmacion().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (ok) => {
        this.reenviando.set(false);
        if (ok) {
          this.notificationService.info(`Te enviamos un enlace a ${this.emailActual()}.`, 'Correo');
        }
      },
      error: () => this.reenviando.set(false),
    });
  }

  getCurrentUser(): void {
    this.securityService.getLoggedUserByJwt().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        const fechaNacimiento = value.fechaNacimiento?.split('/') ?? [];

        if (!this.emailActual()) {
          this.emailActual.set(value.email ?? '');
        }
        this.formGroupCuenta.reset({
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
        this.valoresCuentaOriginales = this.formGroupCuenta.getRawValue();

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
    // Cancelar devuelve el correo original.
    if (!this.changeEmailStatus && this.valoresCuentaOriginales) {
      this.formGroupCuenta.controls['email'].reset(this.valoresCuentaOriginales['email']);
    }
  }

  descartarCuenta(): void {
    if (!this.valoresCuentaOriginales) {
      return;
    }
    this.changeEmailStatus = false;
    const paisOriginal = this.valoresCuentaOriginales['paisId'] as number | undefined;
    if (paisOriginal !== this.formGroupCuenta.value.paisId) {
      this.estados = [];
      this.getEstadosByPais(paisOriginal);
    }
    this.formGroupCuenta.reset(this.valoresCuentaOriginales);
  }

  quitarFondo(): void {
    const control = this.formGroupPersonalizacion.controls['profileBackground'];
    control.setValue('');
    control.markAsDirty();
  }

  updateUsuario(): void {
    const cuenta = Object.assign({}, this.formGroupCuenta.value);
    cuenta.fechaNacimiento = `${cuenta.dia}/${cuenta.mes}/${cuenta.año}`;

    this.guardando.set(true);
    this.securityService.updateUsuario(cuenta).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: () => this.guardando.set(false),
      next: (response) => {
        this.guardando.set(false);
        if (!response) {
          return;
        }
        this.changeEmailStatus = false;
        this.valoresCuentaOriginales = this.formGroupCuenta.getRawValue();
        this.formGroupCuenta.markAsPristine();
        this.notificationService.success('La información de la cuenta ha sido actualizada correctamente', 'Actualizado');
        // Si cambió el correo hay que confirmarlo de nuevo: el API ya envió el enlace a la dirección nueva.
        this.securityService.getEstadoEmail().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((estado) => {
          this.securityService.marcarEmailConfirmado(estado.emailConfirmado);
          this.emailActual.set(estado.email);
          this.emailConfirmado.set(estado.emailConfirmado);
          if (!estado.emailConfirmado) {
            this.notificationService.info(`Te enviamos un enlace a ${estado.email} para confirmar el correo nuevo.`, 'Correo');
          }
        });
      },
    });
  }

  changeAvatar(): void {
    const dialogRef = this.dialog.open(DialogChangeAvatarComponent, {
      width: '350px',
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value) {
        this.formGroupCuenta.patchValue({ avatar: value });
        if (this.valoresCuentaOriginales) {
          this.valoresCuentaOriginales['avatar'] = value;
        }

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
      this.formGroupPersonalizacion.markAsPristine();
      this.notificationService.success('El fondo de tu perfil ha sido actualizado correctamente', 'Actualizado');
    });
  }
}
