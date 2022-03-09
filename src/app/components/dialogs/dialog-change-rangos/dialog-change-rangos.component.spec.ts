import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChangeRangosComponent } from './dialog-change-rangos.component';

describe('DialogChangeRangosComponent', () => {
  let component: DialogChangeRangosComponent;
  let fixture: ComponentFixture<DialogChangeRangosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogChangeRangosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogChangeRangosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
