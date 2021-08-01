import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ads300x250Component } from './ads300x250.component';

describe('Ads300x250Component', () => {
  let component: Ads300x250Component;
  let fixture: ComponentFixture<Ads300x250Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Ads300x250Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Ads300x250Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
