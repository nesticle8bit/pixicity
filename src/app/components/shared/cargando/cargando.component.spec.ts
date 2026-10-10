import { TestBed } from '@angular/core/testing';
import { CargandoComponent } from './cargando.component';

describe('CargandoComponent', () => {
  function crear(entradas: Record<string, unknown> = {}): HTMLElement {
    const fixture = TestBed.createComponent(CargandoComponent);
    Object.entries(entradas).forEach(([k, v]) => fixture.componentRef.setInput(k, v));
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('se anuncia como estado de carga aunque no tenga texto visible', () => {
    const el = crear();
    expect(el.getAttribute('role')).toBe('status');
    expect(el.textContent?.trim()).toBe('Cargando…');
  });

  it('muestra el texto indicado y aplica el tamaño', () => {
    const el = crear({ texto: 'Cargando post…', tamano: 'lg' });
    expect(el.querySelector('.cargando__texto')?.textContent).toBe('Cargando post…');
    expect(el.classList).toContain('cargando--lg');
  });

  it('decorativo (dentro de un botón): no se anuncia', () => {
    const el = crear({ decorativo: true, tamano: 'sm', color: 'actual' });
    expect(el.getAttribute('role')).toBeNull();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.textContent?.trim()).toBe('');
    expect(el.classList).toContain('cargando--actual');
  });
});
