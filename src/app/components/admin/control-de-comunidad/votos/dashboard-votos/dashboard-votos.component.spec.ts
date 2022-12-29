import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardVotosComponent } from './dashboard-votos.component';

describe('DashboardVotosComponent', () => {
  let component: DashboardVotosComponent;
  let fixture: ComponentFixture<DashboardVotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardVotosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardVotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
