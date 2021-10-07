import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePaisesComponent } from './table-paises.component';

describe('TablePaisesComponent', () => {
  let component: TablePaisesComponent;
  let fixture: ComponentFixture<TablePaisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablePaisesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TablePaisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
