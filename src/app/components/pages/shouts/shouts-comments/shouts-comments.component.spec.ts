import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoutsCommentsComponent } from './shouts-comments.component';

describe('ShoutsCommentsComponent', () => {
  let component: ShoutsCommentsComponent;
  let fixture: ComponentFixture<ShoutsCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShoutsCommentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoutsCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
