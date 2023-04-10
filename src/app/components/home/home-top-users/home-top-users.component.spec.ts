import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeTopUsersComponent } from './home-top-users.component';

describe('HomeTopUsersComponent', () => {
  let component: HomeTopUsersComponent;
  let fixture: ComponentFixture<HomeTopUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeTopUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeTopUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
