import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoActividadIconComponent } from './tipo-actividad-icon.component';

describe('TipoActividadIconComponent', () => {
  let component: TipoActividadIconComponent;
  let fixture: ComponentFixture<TipoActividadIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoActividadIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoActividadIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
