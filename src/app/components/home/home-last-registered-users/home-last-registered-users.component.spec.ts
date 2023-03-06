import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeLastRegisteredUsersComponent } from './home-last-registered-users.component';

describe('HomeLastRegisteredUsersComponent', () => {
  let component: HomeLastRegisteredUsersComponent;
  let fixture: ComponentFixture<HomeLastRegisteredUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeLastRegisteredUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeLastRegisteredUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
