import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendMessageButtonComponent } from './send-message-button.component';

describe('SendMessageButtonComponent', () => {
  let component: SendMessageButtonComponent;
  let fixture: ComponentFixture<SendMessageButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendMessageButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendMessageButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
