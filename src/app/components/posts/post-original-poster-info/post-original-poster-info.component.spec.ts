import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UsuarioInfoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { PostOriginalPosterInfoComponent } from './post-original-poster-info.component';

// La tarjeta es app-user-popover-card (que mueve el contador de seguidores sobre el mismo objeto `info`);
// acá solo se prueba que el lateral le pase los datos y el "en línea".
describe('PostOriginalPosterInfoComponent', () => {
  const info = { userName: 'autor', seguidoresCount: 4 } as UsuarioInfoViewModel;

  function crear(perfil: Partial<IHttpUsuarioPerfilService>): PostOriginalPosterInfoComponent {
    TestBed.configureTestingModule({
      providers: [
        { provide: IHttpSecurityService, useValue: { getCurrentUser: () => ({ token: '' }) } },
        { provide: IHttpUsuarioPerfilService, useValue: perfil },
      ],
    });
    const c = TestBed.runInInjectionContext(() => new PostOriginalPosterInfoComponent());
    c.userName = 'autor';
    return c;
  }

  it('carga los datos del autor y los minutos desde su última actividad', () => {
    const c = crear({ getUsuarioInfo: () => of({ ...info }), getUserStatus: () => of(5) });

    expect(c.cargando).toBeFalse();
    expect(c.info?.userName).toBe('autor');
    expect(c.activo).toBe(5);
  });

  it('si falla, deja de mostrar el esqueleto y queda "sin conexión"', () => {
    const c = crear({ getUsuarioInfo: () => throwError(() => new Error('x')), getUserStatus: () => throwError(() => new Error('x')) });

    expect(c.cargando).toBeFalse();
    expect(c.info).toBeUndefined();
    expect(c.activo).toBeNull();
  });
});
