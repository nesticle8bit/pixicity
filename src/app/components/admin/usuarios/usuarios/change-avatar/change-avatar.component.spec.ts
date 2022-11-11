import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAvatarComponent } from './change-avatar.component';

describe('ChangeAvatarComponent', () => {
  let component: ChangeAvatarComponent;
  let fixture: ComponentFixture<ChangeAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeAvatarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
