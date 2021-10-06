import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardConfigurationComponent } from './dashboard-configuration.component';

describe('DashboardConfigurationComponent', () => {
  let component: DashboardConfigurationComponent;
  let fixture: ComponentFixture<DashboardConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
