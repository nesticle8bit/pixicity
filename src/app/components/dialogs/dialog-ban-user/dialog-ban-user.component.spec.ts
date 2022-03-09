import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogBanUserComponent } from './dialog-ban-user.component';

describe('DialogBanUserComponent', () => {
  let component: DialogBanUserComponent;
  let fixture: ComponentFixture<DialogBanUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogBanUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogBanUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
