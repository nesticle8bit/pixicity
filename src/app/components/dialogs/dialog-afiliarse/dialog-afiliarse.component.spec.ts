import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { DialogAfiliarseComponent } from './dialog-afiliarse.component';
import { IHttpGeneralService } from 'src/app/services/interfaces/httpGeneral.interface';

describe('DialogAfiliarseComponent', () => {
  let component: DialogAfiliarseComponent;
  let fixture: ComponentFixture<DialogAfiliarseComponent>;
  let general: jasmine.SpyObj<IHttpGeneralService>;

  beforeEach(async () => {
    general = jasmine.createSpyObj('IHttpGeneralService', ['saveAfiliacion']);

    await TestBed.configureTestingModule({
      declarations: [DialogAfiliarseComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: IHttpGeneralService, useValue: general },
        { provide: MatDialogRef, useValue: {} },
      ],
    })
      .overrideComponent(DialogAfiliarseComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(DialogAfiliarseComponent);
    component = fixture.componentInstance;
  });

  it('es inválido mientras falten los datos de la web', () => {
    expect(component.formGroupAfiliacion.invalid).toBeTrue();
  });

  it('se habilita con título, URL, favicon y descripción (sin captcha)', () => {
    component.formGroupAfiliacion.patchValue({
      titulo: 'Mi web',
      url: 'https://mi.web',
      banner: 'https://mi.web/favicon.ico',
      descripcion: 'Una web',
    });

    expect(component.formGroupAfiliacion.valid).toBeTrue();
  });

  it('envía solo los datos de la web y muestra el código devuelto', () => {
    general.saveAfiliacion.and.returnValue(of(42));
    component.formGroupAfiliacion.patchValue({
      titulo: 'Mi web',
      url: 'https://mi.web',
      banner: 'https://mi.web/favicon.ico',
      descripcion: 'Una web',
    });

    component.enviarAfiliacion();

    expect(general.saveAfiliacion).toHaveBeenCalledWith({
      titulo: 'Mi web',
      url: 'https://mi.web',
      banner: 'https://mi.web/favicon.ico',
      descripcion: 'Una web',
    } as any);
    expect(component.formGroupAfiliacion.value.codigo).toContain('ref=42');
  });

  it('no envía si el formulario es inválido', () => {
    component.enviarAfiliacion();

    expect(general.saveAfiliacion).not.toHaveBeenCalled();
  });
});
