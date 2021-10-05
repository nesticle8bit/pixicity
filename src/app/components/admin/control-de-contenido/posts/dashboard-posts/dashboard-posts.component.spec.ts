import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPostsComponent } from './dashboard-posts.component';

describe('DashboardPostsComponent', () => {
  let component: DashboardPostsComponent;
  let fixture: ComponentFixture<DashboardPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardPostsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
