import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableShoutsComponent } from './table-shouts.component';

describe('TableShoutsComponent', () => {
  let component: TableShoutsComponent;
  let fixture: ComponentFixture<TableShoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableShoutsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableShoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
