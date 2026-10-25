import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { DashboardAdsComponent } from './dashboard-ads.component';
import { ConfiguracionModel } from 'src/app/models/general/configuracion.model';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

/**
 * Regresión: el formulario usaba scriptHeader/scriptFooter pero el API (entidad Configuracion) usa headerScript/footerScript.
 * Resultado: el formulario nunca mostraba los scripts guardados y, al guardar, el API los dejaba vacíos.
 * (Los anuncios ya no están en este formulario: son filas propias, ver table-anuncios.)
 */
describe('DashboardAdsComponent', () => {
  let fixture: ComponentFixture<DashboardAdsComponent>;
  let component: DashboardAdsComponent;
  let general: jasmine.SpyObj<IHttpGeneralService>;

  const configuracion = {
    headerScript: '<script>cabecera()</script>',
    footerScript: '<script>pie()</script>',
  } as ConfiguracionModel;

  beforeEach(async () => {
    general = jasmine.createSpyObj('IHttpGeneralService', ['getConfiguracion', 'updatePublicidad']);
    general.getConfiguracion.and.returnValue(of(configuracion));
    general.updatePublicidad.and.returnValue(of(true));

    await TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, DashboardAdsComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        { provide: IHttpGeneralService, useValue: general },
        { provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['success', 'error']) },
    ],
})
      .overrideComponent(DashboardAdsComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra en el formulario los scripts guardados', () => {
    expect(component.formGroup.value).toEqual({
      headerScript: '<script>cabecera()</script>',
      footerScript: '<script>pie()</script>',
    });
  });

  it('al guardar envía los nombres que espera el API, sin perder los scripts', () => {
    component.guardarScripts();

    const enviado = general.updatePublicidad.calls.mostRecent().args[0];
    expect(enviado).toEqual({ headerScript: '<script>cabecera()</script>', footerScript: '<script>pie()</script>' });
    expect(Object.keys(enviado)).not.toContain('scriptHeader');
    expect(Object.keys(enviado)).not.toContain('scriptFooter');
  });
});
