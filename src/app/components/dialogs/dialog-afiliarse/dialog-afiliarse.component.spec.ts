import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAfiliarseComponent } from './dialog-afiliarse.component';

describe('DialogAfiliarseComponent', () => {
  let component: DialogAfiliarseComponent;
  let fixture: ComponentFixture<DialogAfiliarseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAfiliarseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAfiliarseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
