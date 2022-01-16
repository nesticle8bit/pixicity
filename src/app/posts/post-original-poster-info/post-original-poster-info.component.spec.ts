import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostOriginalPosterInfoComponent } from './post-original-poster-info.component';

describe('PostOriginalPosterInfoComponent', () => {
  let component: PostOriginalPosterInfoComponent;
  let fixture: ComponentFixture<PostOriginalPosterInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostOriginalPosterInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostOriginalPosterInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
