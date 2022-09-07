import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileShoutsWallComponent } from './profile-shouts-wall.component';

describe('ProfileShoutsWallComponent', () => {
  let component: ProfileShoutsWallComponent;
  let fixture: ComponentFixture<ProfileShoutsWallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileShoutsWallComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileShoutsWallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
