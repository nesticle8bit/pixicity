import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModHistoryComponent } from './mod-history.component';

describe('ModHistoryComponent', () => {
  let component: ModHistoryComponent;
  let fixture: ComponentFixture<ModHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
