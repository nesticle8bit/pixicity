import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsuarioInfoViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { PostOriginalPosterInfoComponent } from './post-original-poster-info.component';

describe('PostOriginalPosterInfoComponent', () => {
  const info = { userName: 'autor', seguidoresCount: 4 } as UsuarioInfoViewModel;

  function crear(): PostOriginalPosterInfoComponent {
    TestBed.configureTestingModule({
      providers: [
        { provide: IHttpSecurityService, useValue: { getCurrentUser: () => ({ token: '' }) } },
        { provide: IHttpUsuarioPerfilService, useValue: { getUsuarioInfo: () => of({ ...info }) } },
      ],
    });
    const c = TestBed.runInInjectionContext(() => new PostOriginalPosterInfoComponent());
    c.userName = 'autor';
    return c;
  }

  it('seguir/dejar de seguir mueve el contador que muestra la tarjeta (seguidoresCount)', () => {
    const c = crear();

    c.changeSeguidores(true);
    expect(c.info?.seguidoresCount).toBe(5);

    c.changeSeguidores(false);
    c.changeSeguidores(false);
    expect(c.info?.seguidoresCount).toBe(3);
  });

  it('nunca baja de cero', () => {
    const c = crear();
    for (let i = 0; i < 10; i++) c.changeSeguidores(false);
    expect(c.info?.seguidoresCount).toBe(0);
  });
});
