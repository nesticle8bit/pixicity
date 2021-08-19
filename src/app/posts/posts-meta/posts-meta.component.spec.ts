import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsMetaComponent } from './posts-meta.component';

describe('PostsMetaComponent', () => {
  let component: PostsMetaComponent;
  let fixture: ComponentFixture<PostsMetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostsMetaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostsMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
