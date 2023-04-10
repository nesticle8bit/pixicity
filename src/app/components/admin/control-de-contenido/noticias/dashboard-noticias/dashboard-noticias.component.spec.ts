import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardNoticiasComponent } from './dashboard-noticias.component';

describe('DashboardNoticiasComponent', () => {
  let component: DashboardNoticiasComponent;
  let fixture: ComponentFixture<DashboardNoticiasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardNoticiasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardNoticiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
