import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsNavComponent } from './posts-nav.component';

describe('PostsNavComponent', () => {
  let component: PostsNavComponent;
  let fixture: ComponentFixture<PostsNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostsNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostsNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
