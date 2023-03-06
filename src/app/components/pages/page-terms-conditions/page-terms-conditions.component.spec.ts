import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTermsConditionsComponent } from './page-terms-conditions.component';

describe('PageTermsConditionsComponent', () => {
  let component: PageTermsConditionsComponent;
  let fixture: ComponentFixture<PageTermsConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageTermsConditionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageTermsConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
