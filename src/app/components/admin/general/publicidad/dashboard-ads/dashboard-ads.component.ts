import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TableAnunciosComponent } from '../table-anuncios/table-anuncios.component';

/** Publicidad: los anuncios segmentados (tabla) y los scripts globales de cabecera y pie (p. ej. el de AdSense). */
@Component({
    selector: 'app-dashboard-ads',
    templateUrl: './dashboard-ads.component.html',
    styleUrls: ['./dashboard-ads.component.scss'],
    imports: [ReactiveFormsModule, MatButton, MatIcon, TableAnunciosComponent],
})
export class DashboardAdsComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private generalService = inject(IHttpGeneralService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public readonly formGroup = this.formBuilder.nonNullable.group({
    headerScript: [''],
    footerScript: [''],
  });

  ngOnInit(): void {
    this.generalService.getConfiguracion().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((configuracion) => {
      if (configuracion) {
        this.formGroup.patchValue({
          headerScript: configuracion.headerScript ?? '',
          footerScript: configuracion.footerScript ?? '',
        });
      }
    });
  }

  guardarScripts(): void {
    this.generalService.updatePublicidad(this.formGroup.getRawValue()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.notificationService.success('Los scripts globales se guardaron correctamente', 'Actualizado');
      }
    });
  }
}
