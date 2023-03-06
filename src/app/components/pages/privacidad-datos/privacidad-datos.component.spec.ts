import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacidadDatosComponent } from './privacidad-datos.component';

describe('PrivacidadDatosComponent', () => {
  let component: PrivacidadDatosComponent;
  let fixture: ComponentFixture<PrivacidadDatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivacidadDatosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacidadDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
