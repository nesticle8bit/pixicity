import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEnviarMPComponent } from './dialog-enviar-mp.component';

describe('DialogEnviarMPComponent', () => {
  let component: DialogEnviarMPComponent;
  let fixture: ComponentFixture<DialogEnviarMPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogEnviarMPComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEnviarMPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
