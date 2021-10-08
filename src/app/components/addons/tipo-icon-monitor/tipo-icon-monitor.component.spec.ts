import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoIconMonitorComponent } from './tipo-icon-monitor.component';

describe('TipoIconMonitorComponent', () => {
  let component: TipoIconMonitorComponent;
  let fixture: ComponentFixture<TipoIconMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoIconMonitorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoIconMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
