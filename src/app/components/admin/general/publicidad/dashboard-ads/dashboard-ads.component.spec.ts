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
 */
describe('DashboardAdsComponent', () => {
  let fixture: ComponentFixture<DashboardAdsComponent>;
  let component: DashboardAdsComponent;
  let general: jasmine.SpyObj<IHttpGeneralService>;

  const configuracion = {
    headerScript: '<script>cabecera()</script>',
    footerScript: '<script>pie()</script>',
    banner300x250: 'b1',
    banner468x60: 'b2',
    banner160x600: 'b3',
    banner728x90: 'b4',
  } as ConfiguracionModel;

  beforeEach(async () => {
    general = jasmine.createSpyObj('IHttpGeneralService', ['getConfiguracion', 'updateAds']);
    general.getConfiguracion.and.returnValue(of(configuracion));
    general.updateAds.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      declarations: [DashboardAdsComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: IHttpGeneralService, useValue: general },
        { provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['success', 'error']) },
      ],
    })
      .overrideComponent(DashboardAdsComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra en el formulario los scripts y banners guardados', () => {
    expect(component.formGroup.value).toEqual({
      headerScript: '<script>cabecera()</script>',
      footerScript: '<script>pie()</script>',
      banner300x250: 'b1',
      banner468x60: 'b2',
      banner160x600: 'b3',
      banner728x90: 'b4',
    });
  });

  it('al guardar envía los nombres que espera el API, sin perder los scripts', () => {
    component.updateAds();

    const enviado = general.updateAds.calls.mostRecent().args[0];
    expect(enviado.headerScript).toBe('<script>cabecera()</script>');
    expect(enviado.footerScript).toBe('<script>pie()</script>');
    expect(Object.keys(enviado)).not.toContain('scriptHeader');
    expect(Object.keys(enviado)).not.toContain('scriptFooter');
  });
});
