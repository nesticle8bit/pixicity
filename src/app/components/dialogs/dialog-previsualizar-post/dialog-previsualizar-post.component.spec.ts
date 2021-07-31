import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPrevisualizarPostComponent } from './dialog-previsualizar-post.component';

describe('DialogPrevisualizarPostComponent', () => {
  let component: DialogPrevisualizarPostComponent;
  let fixture: ComponentFixture<DialogPrevisualizarPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogPrevisualizarPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogPrevisualizarPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
