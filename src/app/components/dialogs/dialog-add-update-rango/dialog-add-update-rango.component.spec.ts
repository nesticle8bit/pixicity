import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddUpdateRangoComponent } from './dialog-add-update-rango.component';

describe('DialogAddUpdateRangoComponent', () => {
  let component: DialogAddUpdateRangoComponent;
  let fixture: ComponentFixture<DialogAddUpdateRangoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAddUpdateRangoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAddUpdateRangoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
