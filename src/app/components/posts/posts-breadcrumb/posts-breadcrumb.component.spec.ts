import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsBreadcrumbComponent } from './posts-breadcrumb.component';

describe('PostsBreadcrumbComponent', () => {
  let component: PostsBreadcrumbComponent;
  let fixture: ComponentFixture<PostsBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostsBreadcrumbComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostsBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
