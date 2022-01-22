import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileFollowingComponent } from './profile-following.component';

describe('ProfileFollowingComponent', () => {
  let component: ProfileFollowingComponent;
  let fixture: ComponentFixture<ProfileFollowingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileFollowingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileFollowingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
