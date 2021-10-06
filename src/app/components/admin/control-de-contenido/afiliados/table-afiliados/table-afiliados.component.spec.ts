import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAfiliadosComponent } from './table-afiliados.component';

describe('TableAfiliadosComponent', () => {
  let component: TableAfiliadosComponent;
  let fixture: ComponentFixture<TableAfiliadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableAfiliadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableAfiliadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
