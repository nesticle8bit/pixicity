import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRecomendarPostComponent } from './dialog-recomendar-post.component';

describe('DialogRecomendarPostComponent', () => {
  let component: DialogRecomendarPostComponent;
  let fixture: ComponentFixture<DialogRecomendarPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogRecomendarPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogRecomendarPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
