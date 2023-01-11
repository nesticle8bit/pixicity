import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsGeneratorComponent } from './posts-generator.component';

describe('PostsGeneratorComponent', () => {
  let component: PostsGeneratorComponent;
  let fixture: ComponentFixture<PostsGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostsGeneratorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
