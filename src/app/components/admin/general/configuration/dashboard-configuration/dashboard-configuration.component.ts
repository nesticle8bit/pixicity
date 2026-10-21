import { AdminResumen } from 'src/app/models/seguridad/seguridad-vm.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { SelectAutocompleteComponent } from '../../../../shared/select-autocomplete/select-autocomplete.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-dashboard-configuration',
    templateUrl: './dashboard-configuration.component.html',
    styleUrls: ['./dashboard-configuration.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSlideToggle,
        SelectAutocompleteComponent,
        MatButton,
        MatIcon,
    ],
})
export class DashboardConfigurationComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private generalService = inject(IHttpGeneralService);
  private securityService = inject(IHttpSecurityService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public administradores: AdminResumen[] = [];

  constructor() {
    this.formGroup = this.formBuilder.group({
      siteName: [''],
      slogan: [''],
      url: [''],
      maintenanceMode: [false],
      maintenanceMessage: [''],
      onlineUsersTime: [''],
      disableUserRegistration: [false],
      disableUserRegistrationMessage: [''],
      welcomeUserId: 0,
      welcomeActivated: false,
      welcomeMessage: '',
      welcomeMensajePrivado: false,
      footer: '',
      exigirConfirmacion: false,
      minutosPublicarSinConfirmar: [5, [Validators.min(0), Validators.max(10080)]],
    });
  }

  ngOnInit(): void {
    this.getConfiguracion();
    this.getAdmins();
  }

  getConfiguracion(): void {
    this.generalService.getConfiguracion().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((configuracion) => {
      if (configuracion) {
        this.formGroup.patchValue({
          siteName: configuracion.siteName,
          slogan: configuracion.slogan,
          url: configuracion.url,
          maintenanceMode: configuracion.maintenanceMode,
          maintenanceMessage: configuracion.maintenanceMessage,
          onlineUsersTime: configuracion.onlineUsersTime,
          disableUserRegistration: configuracion.disableUserRegistration,
          disableUserRegistrationMessage:
            configuracion.disableUserRegistrationMessage,
          welcomeUserId: configuracion.welcomeUserId,
          welcomeActivated: configuracion.welcomeActivated,
          welcomeMessage: configuracion.welcomeMessage,
          welcomeMensajePrivado: configuracion.welcomeMensajePrivado ?? false,
          footer: configuracion.footer,
          exigirConfirmacion: (configuracion.minutosPublicarSinConfirmar ?? 5) < 0,
          minutosPublicarSinConfirmar: Math.max(0, configuracion.minutosPublicarSinConfirmar ?? 5),
        });

        // this.formGroup.controls['url'].disable();
      }
    });
  }

  updateConfiguracion(): void {
    const formValue = Object.assign({}, this.formGroup.value);
    formValue.onlineUsersTime = formValue.onlineUsersTime?.toString();
    // -1 = exigir el correo confirmado; si no, los minutos de espera para una cuenta sin confirmar
    formValue.minutosPublicarSinConfirmar = formValue.exigirConfirmacion ? -1 : Math.max(0, Number(formValue.minutosPublicarSinConfirmar) || 0);
    delete formValue.exigirConfirmacion;

    this.generalService
      .updateConfiguracion(formValue)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response) {
          this.notificationService.success('La información de la configuración del sitio ha sido actualizado correctamente', 'Actualizado');
        }
      });
  }

  /** El mensaje con las variables reemplazadas por un ejemplo (el API hace lo mismo al registrar). */
  get mensajeBienvenidaEjemplo(): string {
    const sitio = this.formGroup.value.siteName || 'el sitio';
    return (this.formGroup.value.welcomeMessage ?? '').replace(/\{usuario\}/gi, 'NuevoUsuario').replace(/\{sitio\}/gi, sitio);
  }

  get remitenteBienvenida(): AdminResumen | undefined {
    const id = this.formGroup.value.welcomeUserId;
    return this.administradores.find((admin) => admin.id === id);
  }

  /** Lo que impide enviar la bienvenida (el API también lo valida al guardar). */
  get faltaBienvenida(): string | null {
    if (!this.formGroup.value.welcomeUserId) return 'Elige el usuario que dará la bienvenida.';
    if (!this.formGroup.value.welcomeMessage?.trim()) return 'Escribe el mensaje de bienvenida.';
    if (this.administradores.length && !this.remitenteBienvenida) return 'El usuario elegido ya no es administrador o fue eliminado.';
    return null;
  }

  getAdmins(): void {
    this.securityService.getAdminsList().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.administradores = value;
    });
  }
}
