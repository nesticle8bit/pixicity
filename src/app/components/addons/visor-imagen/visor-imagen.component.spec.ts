import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ShoutMediaComponent } from '../shout-media/shout-media.component';
import { VisorImagenService } from './visor-imagen.service';

describe('Visor de imágenes (shouts)', () => {
  const URL = 'https://taringas.net/images/shouts/yo/abc.webp';

  afterEach(() => TestBed.inject(MatDialog).closeAll());

  const visor = () => document.querySelector('.visor-imagen-panel') as HTMLElement | null;

  it('se abre a pantalla completa con la imagen y una ✕, y cierra con la ✕', async () => {
    TestBed.inject(VisorImagenService).abrir(URL, 'Imagen del shout');
    await new Promise((r) => setTimeout(r));

    expect(visor()).not.toBeNull();
    expect(document.querySelector('.visor-imagen-fondo')).not.toBeNull();
    expect((visor()!.querySelector('.visor__img') as HTMLImageElement).src).toBe(URL);

    (visor()!.querySelector('.visor__cerrar') as HTMLButtonElement).click();
    await new Promise((r) => setTimeout(r, 300));
    expect(visor()).toBeNull();
  });

  it('tocar el fondo negro también cierra; tocar la imagen no', async () => {
    const ref = TestBed.inject(VisorImagenService).abrir(URL);
    await new Promise((r) => setTimeout(r));
    const cerrado = jasmine.createSpy('cerrado');
    ref.afterClosed().subscribe(cerrado);

    (visor()!.querySelector('.visor__img') as HTMLElement).click();
    expect(cerrado).not.toHaveBeenCalled();

    (visor()!.querySelector('.visor') as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 300));
    expect(cerrado).toHaveBeenCalled();
  });

  it('en un shout, el clic en la foto abre el visor (Ctrl+clic deja abrir otra pestaña)', async () => {
    const fixture = TestBed.createComponent(ShoutMediaComponent);
    fixture.componentRef.setInput('url', URL);
    fixture.componentRef.setInput('tipo', 'Foto');
    fixture.detectChanges();
    const abrir = spyOn(TestBed.inject(VisorImagenService), 'abrir');
    const enlace = fixture.nativeElement.querySelector('.sm-foto') as HTMLAnchorElement;

    const ctrl = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
    enlace.dispatchEvent(ctrl);
    expect(abrir).not.toHaveBeenCalled();
    ctrl.preventDefault(); // que el test no abra una pestaña

    const normal = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    enlace.dispatchEvent(normal);
    expect(abrir).toHaveBeenCalledWith(URL, 'Imagen del shout');
    expect(normal.defaultPrevented).toBeTrue();
  });
});
