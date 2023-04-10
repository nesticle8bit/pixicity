import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostMoreFromOPComponent } from './post-more-from-op.component';

describe('PostMoreFromOPComponent', () => {
  let component: PostMoreFromOPComponent;
  let fixture: ComponentFixture<PostMoreFromOPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostMoreFromOPComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostMoreFromOPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
