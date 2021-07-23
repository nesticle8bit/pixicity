import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeTopPostsComponent } from './home-top-posts.component';

describe('HomeTopPostsComponent', () => {
  let component: HomeTopPostsComponent;
  let fixture: ComponentFixture<HomeTopPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeTopPostsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeTopPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
