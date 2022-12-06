import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCategoriasComponent } from './dashboard-categorias.component';

describe('DashboardCategoriasComponent', () => {
  let component: DashboardCategoriasComponent;
  let fixture: ComponentFixture<DashboardCategoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardCategoriasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardCategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
