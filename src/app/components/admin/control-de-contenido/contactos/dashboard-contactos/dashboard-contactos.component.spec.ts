import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardContactosComponent } from './dashboard-contactos.component';

describe('DashboardContactosComponent', () => {
  let component: DashboardContactosComponent;
  let fixture: ComponentFixture<DashboardContactosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardContactosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardContactosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
