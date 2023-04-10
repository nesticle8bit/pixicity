import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOnlineStatusComponent } from './user-online-status.component';

describe('UserOnlineStatusComponent', () => {
  let component: UserOnlineStatusComponent;
  let fixture: ComponentFixture<UserOnlineStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserOnlineStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserOnlineStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
