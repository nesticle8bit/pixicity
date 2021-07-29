import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionUserInfoLoginComponent } from './section-user-info-login.component';

describe('SectionUserInfoLoginComponent', () => {
  let component: SectionUserInfoLoginComponent;
  let fixture: ComponentFixture<SectionUserInfoLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SectionUserInfoLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionUserInfoLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
