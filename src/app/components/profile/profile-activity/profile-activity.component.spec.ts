import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { SIN_PERFIL } from 'src/app/models/seguridad/seguridad-vm.model';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { ProfileActivityComponent } from './profile-activity.component';

describe('ProfileActivityComponent', () => {
  let getActividad: jasmine.Spy;

  beforeEach(() => {
    getActividad = jasmine.createSpy('getActividadUsuario').and.returnValue(of([]));
    TestBed.configureTestingModule({
      providers: [{ provide: IHttpUsuarioPerfilService, useValue: { getActividadUsuario: getActividad } }],
    });
  });

  it('no pide la actividad mientras el perfil no tiene id (el padre arranca con un perfil vacío)', () => {
    const c = TestBed.runInInjectionContext(() => new ProfileActivityComponent());

    c.user = SIN_PERFIL;
    c.user = null;
    c.getActividadUsuario();

    expect(getActividad).not.toHaveBeenCalled();
  });

  it('con el perfil cargado pide la actividad de ese usuario', () => {
    const c = TestBed.runInInjectionContext(() => new ProfileActivityComponent());

    c.user = { id: 9, userName: 'juan' };

    expect(getActividad).toHaveBeenCalledOnceWith(9, '');
  });

  it('pinta el título como texto: un título con HTML no se interpreta', () => {
    getActividad.and.returnValue(
      of({
        hoy: [{ id: 1, fechaRegistro: new Date().toISOString(), tipoActividad: 1, accion: 'Creó un nuevo post', titulo: '<img src=x onerror=alert(1)>', url: '/posts/a/1/b' }],
        ayer: [],
        semana: [],
        mes: [],
      })
    );
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ProfileActivityComponent);

    fixture.componentInstance.user = { id: 9, userName: 'juan' };
    fixture.detectChanges();

    const enlace: HTMLAnchorElement = fixture.nativeElement.querySelector('.actividad__texto a');
    expect(enlace.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(enlace.querySelector('img')).toBeNull();
  });
});
