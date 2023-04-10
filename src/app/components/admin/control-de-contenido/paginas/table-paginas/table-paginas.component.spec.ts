import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePaginasComponent } from './table-paginas.component';

describe('TablePaginasComponent', () => {
  let component: TablePaginasComponent;
  let fixture: ComponentFixture<TablePaginasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablePaginasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablePaginasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
