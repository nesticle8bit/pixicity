import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeRangoComponent } from './change-rango.component';

describe('ChangeRangoComponent', () => {
  let component: ChangeRangoComponent;
  let fixture: ComponentFixture<ChangeRangoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeRangoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeRangoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
