import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAfiliadosComponent } from './dashboard-afiliados.component';

describe('DashboardAfiliadosComponent', () => {
  let component: DashboardAfiliadosComponent;
  let fixture: ComponentFixture<DashboardAfiliadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardAfiliadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardAfiliadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
