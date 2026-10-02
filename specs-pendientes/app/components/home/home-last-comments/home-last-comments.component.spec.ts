import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeLastCommentsComponent } from './home-last-comments.component';

describe('HomeLastCommentsComponent', () => {
  let component: HomeLastCommentsComponent;
  let fixture: ComponentFixture<HomeLastCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [HomeLastCommentsComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeLastCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
