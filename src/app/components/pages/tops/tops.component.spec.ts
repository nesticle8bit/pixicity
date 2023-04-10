import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopsComponent } from './tops.component';

describe('TopsComponent', () => {
  let component: TopsComponent;
  let fixture: ComponentFixture<TopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
