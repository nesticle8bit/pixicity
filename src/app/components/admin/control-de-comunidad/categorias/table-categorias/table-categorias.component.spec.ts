import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCategoriasComponent } from './table-categorias.component';

describe('TableCategoriasComponent', () => {
  let component: TableCategoriasComponent;
  let fixture: ComponentFixture<TableCategoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableCategoriasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableCategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
