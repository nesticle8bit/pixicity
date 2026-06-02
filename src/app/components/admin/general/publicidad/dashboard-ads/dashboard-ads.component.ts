import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-dashboard-ads',
  templateUrl: './dashboard-ads.component.html',
  styleUrls: ['./dashboard-ads.component.scss'],
})
export class DashboardAdsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private generalService: IHttpGeneralService,
    private notificationService: NotificationService
  ) {
    this.formGroup = this.formBuilder.group({
      scriptHeader: [''],
      scriptFooter: [''],
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
    this.generalService.getConfiguracion().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((configuracion: any) => {
      if (configuracion) {
        this.formGroup.patchValue({
          scriptHeader: configuracion.scriptHeader,
          scriptFooter: configuracion.scriptFooter,
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

    this.generalService.updateAds(formValue).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      if(response) {
        this.notificationService.success('La información de la configuración del sitio ha sido actualizado correctamente', 'Actualizado');
      }
    });
  }
}
