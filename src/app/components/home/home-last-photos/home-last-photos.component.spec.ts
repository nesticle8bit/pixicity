import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { FotoViewModel } from 'src/app/models/fotos/foto-vm.model';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { HomeLastPhotosComponent } from './home-last-photos.component';

describe('HomeLastPhotosComponent', () => {
  const fotos = [1, 2, 3, 4, 5].map((id) => ({ id, titulo: `Foto ${id}`, imageUrl: `https://i.postimg.cc/${id}.png`, usuario: 'ana', url: `foto-${id}` }) as FotoViewModel);

  const crear = () => {
    TestBed.configureTestingModule({
      imports: [HomeLastPhotosComponent],
      providers: [provideRouter([]), { provide: IHttpFotosService, useValue: { getTopFotos: () => of(fotos) } }],
    });
    const fixture = TestBed.createComponent(HomeLastPhotosComponent);
    fixture.detectChanges();
    return fixture;
  };

  const srcs = (el: HTMLElement) => Array.from(el.querySelectorAll<HTMLImageElement>('.carousel-slide img')).map((img) => img.getAttribute('src'));

  it('al entrar solo pide la foto visible y la siguiente', () => {
    const fixture = crear();
    fixture.componentInstance.stopTimer();

    const pedidas = srcs(fixture.nativeElement).filter(Boolean);
    expect(pedidas.length).toBe(2);
    expect(fixture.nativeElement.querySelector('.carousel-slide img').getAttribute('fetchpriority')).toBe('high');
  });

  it('al avanzar pide la siguiente y conserva las ya cargadas', () => {
    const fixture = crear();
    const carrusel = fixture.componentInstance;
    carrusel.stopTimer();

    carrusel.next();
    fixture.detectChanges();

    expect(srcs(fixture.nativeElement).filter(Boolean).length).toBe(3);
  });
});
