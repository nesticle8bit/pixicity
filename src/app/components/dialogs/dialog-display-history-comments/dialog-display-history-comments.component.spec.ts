import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDisplayHistoryCommentsComponent } from './dialog-display-history-comments.component';

describe('DialogDisplayHistoryCommentsComponent', () => {
  let component: DialogDisplayHistoryCommentsComponent;
  let fixture: ComponentFixture<DialogDisplayHistoryCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDisplayHistoryCommentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDisplayHistoryCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
