import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { DialogInteraccionesPostComponent } from './dialog-interacciones-post.component';

describe('DialogInteraccionesPostComponent', () => {
  const usuario = (n: number) => ({ userName: 'u' + n, avatar: null, cantidad: n, fecha: '2026-10-16T00:00:00Z' });

  it('pagina con "Ver más" y no repite usuarios', async () => {
    const pagina = jasmine
      .createSpy('getInteraccionesPostPagina')
      .and.returnValues(of({ items: [usuario(1), usuario(2)], total: 3 }), of({ items: [usuario(2), usuario(3)], total: 3 }));

    await TestBed.configureTestingModule({
      imports: [DialogInteraccionesPostComponent],
      providers: [
        provideRouter([]),
        { provide: IHttpPostsService, useValue: { getInteraccionesPostPagina: pagina } },
        { provide: MAT_DIALOG_DATA, useValue: { postId: 10, tipo: 'votos' } },
        { provide: MatDialogRef, useValue: { close: () => {} } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DialogInteraccionesPostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(pagina).toHaveBeenCalledWith(10, 'votos', 1);
    expect(el.querySelectorAll('.dip-item').length).toBe(2);
    expect(el.textContent).toContain('Le dieron puntos');
    expect(el.textContent).toContain('+2');

    (el.querySelector('.dip-mas') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(pagina).toHaveBeenCalledWith(10, 'votos', 2);
    expect(el.querySelectorAll('.dip-item').length).toBe(3);
    expect(el.querySelector('.dip-mas')).toBeNull();
  });
});
