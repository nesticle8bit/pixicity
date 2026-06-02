import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-dashboard-configuration',
  templateUrl: './dashboard-configuration.component.html',
  styleUrls: ['./dashboard-configuration.component.scss'],
})
export class DashboardConfigurationComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public administradores: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private generalService: IHttpGeneralService,
    private securityService: IHttpSecurityService,
    private notificationService: NotificationService
  ) {
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
    this.generalService.getConfiguracion().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((configuracion: any) => {
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
      .subscribe((response: any) => {
        if (response) {
          this.notificationService.success('La información de la configuración del sitio ha sido actualizado correctamente', 'Actualizado');
        }
      });
  }

  getAdmins(): void {
    this.securityService.getAdminsList().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      this.administradores = value;
    });
  }
}
