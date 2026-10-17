import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { IHttpMiService } from 'src/app/services/interfaces/httpMi.interface';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { EmojisPopoverService } from '../../../bottom-sheets/bottom-sheets-emojis/emojis-popover.service';
import { ShoutComposerComponent } from './shout-composer.component';

describe('ShoutComposerComponent (imagen)', () => {
  const URL_SUBIDA = 'https://taringas.net/images/shouts/yo/abc.webp';
  let perfil: jasmine.SpyObj<IHttpPerfilService>;
  let notificaciones: jasmine.SpyObj<NotificationService>;

  const crear = async () => {
    perfil = jasmine.createSpyObj('IHttpPerfilService', ['subirImagenShout', 'createShout']);
    perfil.subirImagenShout.and.returnValue(of(URL_SUBIDA));
    perfil.createShout.and.returnValue(of({ id: 1 } as any));
    notificaciones = jasmine.createSpyObj('NotificationService', ['error', 'info', 'success']);

    await TestBed.configureTestingModule({
      imports: [ShoutComposerComponent],
      providers: [
        { provide: IHttpPerfilService, useValue: perfil },
        { provide: IHttpMiService, useValue: { buscarHashtags: () => of([]) } },
        { provide: IHttpSecurityService, useValue: { getCurrentUser: () => ({ usuario: { userName: 'yo' }, token: 't' }) } },
        { provide: NotificationService, useValue: notificaciones },
        { provide: EmojisPopoverService, useValue: {} },
      ],
    })
      .overrideComponent(ShoutComposerComponent, { set: { template: '', imports: [], schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    const fixture = TestBed.createComponent(ShoutComposerComponent);
    fixture.componentRef.setInput('perfilId', 7);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  async function pngGrande(): Promise<File> {
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 1000;
    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/png'));
    return new File([blob], 'foto.png', { type: 'image/png' });
  }

  it('comprime la imagen elegida, la sube y la deja como media del shout', async () => {
    const c = await crear();

    await c.elegirImagen({ target: { files: [await pngGrande()], value: 'foto.png' } } as any);

    const enviado = perfil.subirImagenShout.calls.mostRecent().args[0];
    expect((await createImageBitmap(enviado)).width).toBe(1080);
    expect(c.formGroup.value.url).toBe(URL_SUBIDA);
    expect(c.imagenSubida()).toBeTrue();
    expect(c.subiendoImagen()).toBeFalse();

    c.formGroup.patchValue({ comentario: 'mirá esto' });
    c.publicar();
    expect(perfil.createShout).toHaveBeenCalledWith(jasmine.objectContaining({ url: URL_SUBIDA, perfilId: 7 }));
    expect(c.imagenSubida()).toBeFalse(); // se limpia al publicar
  });

  it('rechaza archivos que no son imágenes', async () => {
    const c = await crear();

    await c.elegirImagen({ target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })], value: '' } } as any);

    expect(perfil.subirImagenShout).not.toHaveBeenCalled();
    expect(notificaciones.error).toHaveBeenCalled();
  });

  it('quitar la imagen vuelve al campo de enlace', async () => {
    const c = await crear();
    await c.elegirImagen({ target: { files: [await pngGrande()], value: '' } } as any);

    c.quitarMedia();

    expect(c.formGroup.value.url).toBe('');
    expect(c.imagenSubida()).toBeFalse();
  });
});
