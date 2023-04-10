import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajesEnviadosComponent } from './mensajes-enviados.component';

describe('MensajesEnviadosComponent', () => {
  let component: MensajesEnviadosComponent;
  let fixture: ComponentFixture<MensajesEnviadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MensajesEnviadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MensajesEnviadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
