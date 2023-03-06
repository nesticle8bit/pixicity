import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPaginasComponent } from './dashboard-paginas.component';

describe('DashboardPaginasComponent', () => {
  let component: DashboardPaginasComponent;
  let fixture: ComponentFixture<DashboardPaginasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardPaginasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPaginasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
