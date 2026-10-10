import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BottomSheetsEmojisComponent } from './bottom-sheets-emojis.component';

describe('BottomSheetsEmojisComponent', () => {
  let fixture: ComponentFixture<BottomSheetsEmojisComponent>;
  let el: HTMLElement;

  function crear(): void {
    fixture = TestBed.createComponent(BottomSheetsEmojisComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  }

  beforeEach(() => {
    localStorage.removeItem('emojis-recientes');
    TestBed.configureTestingModule({ imports: [BottomSheetsEmojisComponent] });
  });

  afterEach(() => localStorage.removeItem('emojis-recientes'));

  it('sin recientes abre en Caras y cambia de categoría con las pestañas', () => {
    crear();
    expect(el.querySelector('.emojis__titulo')?.textContent).toContain('Caras');

    (el.querySelector('[aria-label="Comida y bebida"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(el.querySelector('.emojis__titulo')?.textContent).toContain('Comida');
    expect(el.querySelector('.emojis__emoji')?.textContent).toBe('🍏');
  });

  it('emite el emoji elegido, lo guarda en recientes y la próxima vez abre en Recientes', () => {
    crear();
    const elegidos: string[] = [];
    fixture.componentInstance.elegido.subscribe((e) => elegidos.push(e));

    (el.querySelectorAll('.emojis__emoji')[2] as HTMLButtonElement).click();
    (el.querySelectorAll('.emojis__emoji')[0] as HTMLButtonElement).click();

    expect(elegidos).toEqual(['😄', '😀']);
    expect(JSON.parse(localStorage.getItem('emojis-recientes')!)).toEqual(['😀', '😄']);

    crear();
    expect(el.querySelector('.emojis__titulo')?.textContent).toContain('recientemente');
    expect(Array.from(el.querySelectorAll('.emojis__emoji')).map((b) => b.textContent)).toEqual(['😀', '😄']);
  });

  it('ignora recientes corruptos en el almacenamiento', () => {
    localStorage.setItem('emojis-recientes', '{no es json');
    crear();
    expect(el.querySelector('.emojis__titulo')?.textContent).toContain('Caras');
  });

  it('Escape pide cerrar', () => {
    crear();
    const cerrar = jasmine.createSpy('cerrar');
    fixture.componentInstance.cerrar.subscribe(cerrar);

    el.querySelector('.emojis__emoji')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(cerrar).toHaveBeenCalled();
  });
});
