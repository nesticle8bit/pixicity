import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionHomeForumComponent } from './section-home-forum.component';

describe('SectionHomeForumComponent', () => {
  let component: SectionHomeForumComponent;
  let fixture: ComponentFixture<SectionHomeForumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SectionHomeForumComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionHomeForumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
