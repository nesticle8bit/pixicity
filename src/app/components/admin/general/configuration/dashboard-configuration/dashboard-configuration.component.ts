import { UsuarioViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  public administradores: UsuarioViewModel[] = [];

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
      footer: ''
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
          footer: configuracion.footer,
        });

        // this.formGroup.controls['url'].disable();
      }
    });
  }

  updateConfiguracion(): void {
    const formValue = Object.assign({}, this.formGroup.value);
    formValue.onlineUsersTime = formValue.onlineUsersTime?.toString();

    this.generalService
      .updateConfiguracion(formValue)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response) {
          this.notificationService.success('La información de la configuración del sitio ha sido actualizado correctamente', 'Actualizado');
        }
      });
  }

  getAdmins(): void {
    this.securityService.getAdminsList().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.administradores = value;
    });
  }
}
