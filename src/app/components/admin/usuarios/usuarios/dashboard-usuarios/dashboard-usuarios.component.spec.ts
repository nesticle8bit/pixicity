import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUsuariosComponent } from './dashboard-usuarios.component';

describe('DashboardUsuariosComponent', () => {
  let component: DashboardUsuariosComponent;
  let fixture: ComponentFixture<DashboardUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardUsuariosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
