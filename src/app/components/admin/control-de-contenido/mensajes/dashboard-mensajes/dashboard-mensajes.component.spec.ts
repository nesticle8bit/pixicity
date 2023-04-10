import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMensajesComponent } from './dashboard-mensajes.component';

describe('DashboardMensajesComponent', () => {
  let component: DashboardMensajesComponent;
  let fixture: ComponentFixture<DashboardMensajesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardMensajesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardMensajesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
