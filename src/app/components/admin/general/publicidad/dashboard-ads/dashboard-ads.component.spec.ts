import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAdsComponent } from './dashboard-ads.component';

describe('DashboardAdsComponent', () => {
  let component: DashboardAdsComponent;
  let fixture: ComponentFixture<DashboardAdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardAdsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
