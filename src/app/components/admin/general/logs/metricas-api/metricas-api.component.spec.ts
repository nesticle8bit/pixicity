import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MetricasApi } from 'src/app/models/admin/dashboard.model';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';
import { MetricasApiComponent } from './metricas-api.component';

describe('MetricasApiComponent', () => {
  let fixture: ComponentFixture<MetricasApiComponent>;
  const servicio = { getMetricasApi: jasmine.createSpy('getMetricasApi') };

  const metricas = (parcial: Partial<MetricasApi> = {}): MetricasApi => ({
    minutos: 15,
    peticiones: 120,
    peticionesPorMinuto: 8,
    errores: 12,
    tasaError: 0.1,
    p50Ms: 40,
    p95Ms: 2500,
    masLentas: [{ ruta: 'GET api/posts/getPosts', peticiones: 50, errores: 0, promedioMs: 900, p95Ms: 2500, maxMs: 3100 }],
    conErrores: [{ ruta: 'POST api/posts/savePost', peticiones: 20, errores: 12, promedioMs: 100, p95Ms: 200, maxMs: 300 }],
    masUsadas: [],
    ...parcial,
  });

  beforeEach(async () => {
    servicio.getMetricasApi.calls.reset();
    servicio.getMetricasApi.and.returnValue(of(metricas()));
    await TestBed.configureTestingModule({
      imports: [MetricasApiComponent],
      providers: [{ provide: IHttpGeneralService, useValue: servicio }],
    }).compileComponents();
    fixture = TestBed.createComponent(MetricasApiComponent);
    fixture.detectChanges();
  });

  it('muestra los indicadores y marca en alerta la tasa de errores y el p95 lento', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(servicio.getMetricasApi).toHaveBeenCalledWith(15);
    expect(el.textContent).toContain('GET api/posts/getPosts');
    expect(el.textContent).toContain('POST api/posts/savePost');
    expect(el.querySelectorAll('.metricas__stat--alerta').length).toBe(2);
  });

  it('cambiar a 60 minutos vuelve a pedir las métricas', () => {
    const botones = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('.metricas__acciones button'));
    botones.find((b) => b.textContent?.includes('60'))!.click();
    expect(servicio.getMetricasApi).toHaveBeenCalledWith(60);
  });

  it('sin tráfico explica que no hay datos', () => {
    servicio.getMetricasApi.and.returnValue(of(metricas({ peticiones: 0, masLentas: [], conErrores: [] })));
    fixture.componentInstance.cargar();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sin peticiones');
  });
});
