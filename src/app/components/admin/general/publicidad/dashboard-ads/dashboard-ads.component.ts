import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-dashboard-ads',
    templateUrl: './dashboard-ads.component.html',
    styleUrls: ['./dashboard-ads.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatButton,
        MatIcon,
    ],
})
export class DashboardAdsComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private generalService = inject(IHttpGeneralService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;

  constructor() {
    this.formGroup = this.formBuilder.group({
      headerScript: [''],
      footerScript: [''],
      banner300x250: [''],
      banner468x60: [''],
      banner160x600: [''],
      banner728x90: [''],
    });
  }

  ngOnInit(): void {
    this.getConfiguracion();
  }

  getConfiguracion(): void {
    this.generalService.getConfiguracion().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((configuracion) => {
      if (configuracion) {
        this.formGroup.patchValue({
          headerScript: configuracion.headerScript,
          footerScript: configuracion.footerScript,
          banner300x250: configuracion.banner300x250,
          banner468x60: configuracion.banner468x60,
          banner160x600: configuracion.banner160x600,
          banner728x90: configuracion.banner728x90,
        });
      }
    });
  }

  updateAds(): void {
    const formValue = Object.assign({}, this.formGroup.value);

    this.generalService.updateAds(formValue).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if(response) {
        this.notificationService.success('La información de la configuración del sitio ha sido actualizado correctamente', 'Actualizado');
      }
    });
  }
}
