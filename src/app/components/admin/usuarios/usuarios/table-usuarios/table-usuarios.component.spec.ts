import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableUsuariosComponent } from './table-usuarios.component';

describe('TableUsuariosComponent', () => {
  let component: TableUsuariosComponent;
  let fixture: ComponentFixture<TableUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableUsuariosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
