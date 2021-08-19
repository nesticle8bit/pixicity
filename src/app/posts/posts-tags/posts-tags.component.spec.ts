import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsTagsComponent } from './posts-tags.component';

describe('PostsTagsComponent', () => {
  let component: PostsTagsComponent;
  let fixture: ComponentFixture<PostsTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostsTagsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostsTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
