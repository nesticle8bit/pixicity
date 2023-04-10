import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoutsViewComponent } from './shouts-view.component';

describe('ShoutsViewComponent', () => {
  let component: ShoutsViewComponent;
  let fixture: ComponentFixture<ShoutsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShoutsViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoutsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
