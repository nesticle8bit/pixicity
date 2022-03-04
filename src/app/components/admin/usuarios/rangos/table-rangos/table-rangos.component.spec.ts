import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRangosComponent } from './table-rangos.component';

describe('TableRangosComponent', () => {
  let component: TableRangosComponent;
  let fixture: ComponentFixture<TableRangosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableRangosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableRangosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
