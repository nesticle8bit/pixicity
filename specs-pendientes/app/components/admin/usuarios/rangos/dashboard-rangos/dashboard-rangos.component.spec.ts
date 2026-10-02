import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRangosComponent } from './dashboard-rangos.component';

describe('DashboardRangosComponent', () => {
  let component: DashboardRangosComponent;
  let fixture: ComponentFixture<DashboardRangosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [DashboardRangosComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardRangosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
