import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSesionesComponent } from './table-sesiones.component';

describe('TableSesionesComponent', () => {
  let component: TableSesionesComponent;
  let fixture: ComponentFixture<TableSesionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableSesionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableSesionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
