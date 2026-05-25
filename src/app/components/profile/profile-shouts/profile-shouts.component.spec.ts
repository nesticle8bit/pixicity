import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileShoutsComponent } from './profile-shouts.component';

describe('ProfileShoutsComponent', () => {
  let component: ProfileShoutsComponent;
  let fixture: ComponentFixture<ProfileShoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ProfileShoutsComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileShoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
