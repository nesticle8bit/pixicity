import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardShoutsComponent } from './dashboard-shouts.component';

describe('DashboardShoutsComponent', () => {
  let component: DashboardShoutsComponent;
  let fixture: ComponentFixture<DashboardShoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardShoutsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardShoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
