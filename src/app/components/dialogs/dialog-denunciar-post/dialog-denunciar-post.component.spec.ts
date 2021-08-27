import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDenunciarPostComponent } from './dialog-denunciar-post.component';

describe('DialogDenunciarPostComponent', () => {
  let component: DialogDenunciarPostComponent;
  let fixture: ComponentFixture<DialogDenunciarPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDenunciarPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDenunciarPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
