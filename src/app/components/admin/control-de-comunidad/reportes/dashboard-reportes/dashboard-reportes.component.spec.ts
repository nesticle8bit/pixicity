import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardReportesComponent } from './dashboard-reportes.component';

describe('DashboardReportesComponent', () => {
  let component: DashboardReportesComponent;
  let fixture: ComponentFixture<DashboardReportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardReportesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
