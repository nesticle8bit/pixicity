import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Anuncio, COMPONENTES_ANUNCIO, escribirAnuncios, leerAnuncios } from '../../../../ads/ads-rotacion';

/** Espacios de publicidad: campo de Configuracion y etiqueta. */
export const TAMANOS_ANUNCIO = [
  { campo: 'banner300x250', nombre: 'Banner 300x250' },
  { campo: 'banner468x60', nombre: 'Banner 468x60' },
  { campo: 'banner160x600', nombre: 'Banner 160x600' },
  { campo: 'banner728x90', nombre: 'Banner 728x90' },
] as const;

@Component({
    selector: 'app-dashboard-ads',
    templateUrl: './dashboard-ads.component.html',
    styleUrls: ['./dashboard-ads.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatButton,
        MatIconButton,
        MatIcon,
    ],
})
export class DashboardAdsComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private generalService = inject(IHttpGeneralService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  readonly tamanos = TAMANOS_ANUNCIO;
  readonly componentes = COMPONENTES_ANUNCIO;

  public formGroup: FormGroup;

  constructor() {
    this.formGroup = this.formBuilder.group({
      headerScript: [''],
      footerScript: [''],
      // Cada tamaño es una lista de anuncios; en la página se muestra uno al azar.
      banner300x250: this.formBuilder.array<FormGroup>([]),
      banner468x60: this.formBuilder.array<FormGroup>([]),
      banner160x600: this.formBuilder.array<FormGroup>([]),
      banner728x90: this.formBuilder.array<FormGroup>([]),
    });
  }

  ngOnInit(): void {
    this.getConfiguracion();
  }

  anuncios(campo: string): FormArray<FormGroup> {
    return this.formGroup.get(campo) as FormArray<FormGroup>;
  }

  agregarAnuncio(campo: string, anuncio: Anuncio = { tipo: 'html', html: '' }): void {
    this.anuncios(campo).push(this.formBuilder.group({
      tipo: [anuncio.tipo],
      html: [anuncio.html ?? ''],
      componente: [anuncio.componente ?? this.componentes[0].id],
      variante: [anuncio.variante ?? 'cuadrado'],
    }));
  }

  quitarAnuncio(campo: string, indice: number): void {
    this.anuncios(campo).removeAt(indice);
  }

  getConfiguracion(): void {
    this.generalService.getConfiguracion().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((configuracion) => {
      if (configuracion) {
        this.formGroup.patchValue({
          headerScript: configuracion.headerScript,
          footerScript: configuracion.footerScript,
        });
        for (const { campo } of this.tamanos) {
          this.anuncios(campo).clear();
          leerAnuncios(configuracion[campo]).forEach((a) => this.agregarAnuncio(campo, a));
        }
      }
    });
  }

  updateAds(): void {
    const formValue = Object.assign({}, this.formGroup.value);
    for (const { campo } of this.tamanos) {
      formValue[campo] = escribirAnuncios(formValue[campo]);
    }

    this.generalService.updatePublicidad(formValue).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if(response) {
        this.notificationService.success('La información de la configuración del sitio ha sido actualizado correctamente', 'Actualizado');
      }
    });
  }
}
