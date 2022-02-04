import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdsByTypeComponent } from './ads-by-type.component';

describe('AdsByTypeComponent', () => {
  let component: AdsByTypeComponent;
  let fixture: ComponentFixture<AdsByTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdsByTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdsByTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
