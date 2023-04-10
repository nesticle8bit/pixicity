import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostRelatedPostsComponent } from './post-related-posts.component';

describe('PostRelatedPostsComponent', () => {
  let component: PostRelatedPostsComponent;
  let fixture: ComponentFixture<PostRelatedPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostRelatedPostsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostRelatedPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
