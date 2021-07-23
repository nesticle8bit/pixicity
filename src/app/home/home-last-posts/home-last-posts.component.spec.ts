import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeLastPostsComponent } from './home-last-posts.component';

describe('HomeLastPostsComponent', () => {
  let component: HomeLastPostsComponent;
  let fixture: ComponentFixture<HomeLastPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeLastPostsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeLastPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
