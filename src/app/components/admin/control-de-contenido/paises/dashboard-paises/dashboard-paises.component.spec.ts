import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPaisesComponent } from './dashboard-paises.component';

describe('DashboardPaisesComponent', () => {
  let component: DashboardPaisesComponent;
  let fixture: ComponentFixture<DashboardPaisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardPaisesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPaisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
