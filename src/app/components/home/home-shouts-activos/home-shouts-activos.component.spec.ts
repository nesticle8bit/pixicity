import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { IHttpMiService } from 'src/app/services/interfaces/httpMi.interface';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { NsfwService } from 'src/app/services/shared/nsfw.service';
import { Muro, MuroItem } from 'src/app/models/mi/mi-vm.model';
import { ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';
import { HomeShoutsActivosComponent } from './home-shouts-activos.component';

const shout = (id: number, comentario = `shout ${id}`): ShoutViewModel =>
  ({ id, comentario, tipo: 'Texto', url: '', avatar: { userName: 'ana', avatar: null }, fechaRegistro: new Date().toISOString() }) as ShoutViewModel;

const muro = (...items: Partial<MuroItem>[]): Muro => ({ items: items as MuroItem[], siguiente: null });

describe('HomeShoutsActivosComponent', () => {
  let mi: jasmine.SpyObj<IHttpMiService>;
  let fixture: ComponentFixture<HomeShoutsActivosComponent>;

  const textos = () => Array.from(fixture.nativeElement.querySelectorAll('.ts-texto p')).map((e) => (e as HTMLElement).textContent?.trim());
  const activa = () => (fixture.nativeElement.querySelector('.carousel-slide.active .ts-texto p') as HTMLElement)?.textContent?.trim();
  const titulo = () => (fixture.nativeElement.querySelector('.main-title') as HTMLElement).textContent?.trim();

  beforeEach(() => {
    mi = jasmine.createSpyObj<IHttpMiService>('IHttpMiService', ['getActivos', 'getMuro']);
    mi.getActivos.and.returnValue(of(muro({ tipo: 'shout', shout: shout(1) }, { tipo: 'shout', shout: shout(2) })));
    mi.getMuro.and.returnValue(of(muro()));

    TestBed.configureTestingModule({
      imports: [HomeShoutsActivosComponent],
      providers: [
        provideRouter([]),
        { provide: IHttpMiService, useValue: mi },
        { provide: NsfwService, useValue: { mostrar: () => false } },
        // Lo pide el popover del usuario al pasar el mouse; acá no se usa.
        { provide: IHttpUsuarioPerfilService, useValue: {} },
      ],
    });
    fixture = TestBed.createComponent(HomeShoutsActivosComponent);
  });

  it('por defecto muestra los más activos del día', () => {
    fixture.detectChanges();

    expect(mi.getActivos).toHaveBeenCalledWith('dia', 1, 5, true);
    expect(titulo()).toBe('Shouts del día');
    expect(textos()).toEqual(['shout 1', 'shout 2']);
  });

  it('cambiar el período vuelve a pedir y cambia el título', () => {
    fixture.componentRef.setInput('periodo', 'semana');
    fixture.componentRef.setInput('cantidad', 10);
    fixture.detectChanges();

    expect(mi.getActivos).toHaveBeenCalledWith('semana', 1, 10, true);
    expect(titulo()).toBe('Shouts de la semana');
  });

  it('modo recientes usa el muro de todos, sin posts y sin repetir reshouts', () => {
    mi.getMuro.and.returnValue(of(muro(
      { tipo: 'shout', shout: shout(3) },
      { tipo: 'post', shout: null },
      { tipo: 'reshout', shout: shout(3) },
      { tipo: 'shout', shout: shout(4) },
    )));
    fixture.componentRef.setInput('modo', 'recientes');
    fixture.detectChanges();

    expect(mi.getMuro).toHaveBeenCalledWith('todos', null, 5);
    expect(mi.getActivos).not.toHaveBeenCalled();
    expect(titulo()).toBe('Shouts recientes');
    expect(textos()).toEqual(['shout 3', 'shout 4']);
  });

  it('el carrusel avanza con las flechas y pausar no lo vuelve al primero', () => {
    fixture.detectChanges();
    expect(activa()).toBe('shout 1');

    (fixture.nativeElement.querySelector('.carousel-next') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(activa()).toBe('shout 2');

    fixture.componentInstance.alternarPausa();
    fixture.detectChanges();
    expect(activa()).toBe('shout 2');

    (fixture.nativeElement.querySelector('.carousel-next') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(activa()).toBe('shout 1');
  });

  it('sin shouts muestra el aviso del período', () => {
    mi.getActivos.and.returnValue(of(muro()));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.alert')?.textContent).toContain('Hoy todavía no hay shouts');
  });
});
