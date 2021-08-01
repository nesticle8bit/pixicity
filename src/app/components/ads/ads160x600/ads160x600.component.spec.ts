import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ads160x600Component } from './ads160x600.component';

describe('Ads160x600Component', () => {
  let component: Ads160x600Component;
  let fixture: ComponentFixture<Ads160x600Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Ads160x600Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Ads160x600Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
