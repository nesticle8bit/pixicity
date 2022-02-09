import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard-configuration',
  templateUrl: './dashboard-configuration.component.html',
  styleUrls: ['./dashboard-configuration.component.scss']
})
export class DashboardConfigurationComponent implements OnInit {
  public formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private generalService: IHttpGeneralService
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
    });
  }

  ngOnInit(): void {
    this.getConfiguracion();
  }

  getConfiguracion(): void {
    this.generalService.getConfiguracion().subscribe((configuracion: any) => {
      if(configuracion) {
        this.formGroup.patchValue({
          siteName: configuracion.siteName,
          slogan: configuracion.slogan,
          url: configuracion.url,
          maintenanceMode: configuracion.maintenanceMode,
          maintenanceMessage: configuracion.maintenanceMessage,
          onlineUsersTime: configuracion.onlineUsersTime,
          disableUserRegistration: configuracion.disableUserRegistration,
          disableUserRegistrationMessage: configuracion.disableUserRegistrationMessage,
        });

        this.formGroup.controls['url'].disable();
      }
    });
  }

  updateConfiguracion(): void {
    const formValue = Object.assign({}, this.formGroup.value);
    formValue.onlineUsersTime = formValue.onlineUsersTime?.toString();

    this.generalService.updateConfiguracion(formValue).subscribe((response: any) => {
      if(response) {
        Swal.fire({
          title: 'Actualizado',
          text: 'La información de la configuración del sitio ha sido actualizado correctamente',
          icon: 'success',
          timer: 3000
        });
      }
    });
  }
}
