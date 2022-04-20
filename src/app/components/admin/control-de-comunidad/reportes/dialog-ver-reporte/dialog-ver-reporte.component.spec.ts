import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogVerReporteComponent } from './dialog-ver-reporte.component';

describe('DialogVerReporteComponent', () => {
  let component: DialogVerReporteComponent;
  let fixture: ComponentFixture<DialogVerReporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogVerReporteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogVerReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
