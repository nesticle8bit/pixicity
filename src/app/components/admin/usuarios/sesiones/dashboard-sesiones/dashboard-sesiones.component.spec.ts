import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSesionesComponent } from './dashboard-sesiones.component';

describe('DashboardSesionesComponent', () => {
  let component: DashboardSesionesComponent;
  let fixture: ComponentFixture<DashboardSesionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardSesionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardSesionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
