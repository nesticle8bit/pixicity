import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCommentsComponent } from './dashboard-comments.component';

describe('DashboardCommentsComponent', () => {
  let component: DashboardCommentsComponent;
  let fixture: ComponentFixture<DashboardCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardCommentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
