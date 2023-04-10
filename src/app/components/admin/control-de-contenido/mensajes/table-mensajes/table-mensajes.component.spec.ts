import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableMensajesComponent } from './table-mensajes.component';

describe('TableMensajesComponent', () => {
  let component: TableMensajesComponent;
  let fixture: ComponentFixture<TableMensajesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableMensajesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableMensajesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
