import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajesConversacionComponent } from './mensajes-conversacion.component';

describe('MensajesConversacionComponent', () => {
  let component: MensajesConversacionComponent;
  let fixture: ComponentFixture<MensajesConversacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MensajesConversacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MensajesConversacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
