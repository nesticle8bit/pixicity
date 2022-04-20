import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostUrlLinkComponent } from './post-url-link.component';

describe('PostUrlLinkComponent', () => {
  let component: PostUrlLinkComponent;
  let fixture: ComponentFixture<PostUrlLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostUrlLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostUrlLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
