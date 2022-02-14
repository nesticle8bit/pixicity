import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsCloudComponent } from './tags-cloud.component';

describe('TagsCloudComponent', () => {
  let component: TagsCloudComponent;
  let fixture: ComponentFixture<TagsCloudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagsCloudComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsCloudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
