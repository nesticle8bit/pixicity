import { agregarColumna, agregarFila, celdaInicial, celdaVecina, crearTabla, quitarColumna, quitarFila } from './rich-editor-tablas';

describe('rich-editor-tablas', () => {
  const tabla = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.querySelector('table')!;
  };

  it('crearTabla arma encabezado + filas y empieza en la primera celda del cuerpo', () => {
    const t = crearTabla(3, 2);
    expect(t.tHead!.rows[0].cells[1].textContent).toBe('Columna 2');
    expect(t.tBodies[0].rows.length).toBe(2);
    expect(celdaInicial(t)).toBe(t.tBodies[0].rows[0].cells[0]);
    expect(celdaInicial(crearTabla(1, 2)).tagName).toBe('TH');
  });

  it('una fila agregada bajo el encabezado va al principio del cuerpo', () => {
    const t = tabla('<table><thead><tr><th>h</th></tr></thead><tbody><tr><td>a</td></tr></tbody></table>');
    const nueva = agregarFila(t.tHead!.rows[0].cells[0]);
    expect(t.tBodies[0].rows[0].cells[0]).toBe(nueva);
  });

  it('agregarColumna usa th en el encabezado y td en el cuerpo', () => {
    const t = tabla('<table><thead><tr><th>h</th></tr></thead><tbody><tr><td>a</td></tr></tbody></table>');
    agregarColumna(t.tBodies[0].rows[0].cells[0]);
    expect(t.tHead!.rows[0].cells[1].tagName).toBe('TH');
    expect(t.tBodies[0].rows[0].cells[1].tagName).toBe('TD');
  });

  it('quitar la única fila o columna devuelve null (hay que borrar la tabla)', () => {
    const t = tabla('<table><tbody><tr><td>a</td></tr></tbody></table>');
    expect(quitarFila(t.rows[0].cells[0])).toBeNull();
    expect(quitarColumna(t.rows[0].cells[0])).toBeNull();
    expect(t.rows.length).toBe(1);
  });

  it('quitarFila deja el caret en la fila que ocupa su lugar y borra la sección vacía', () => {
    const t = tabla('<table><thead><tr><th>h</th></tr></thead><tbody><tr><td>a</td></tr></tbody></table>');
    const siguiente = quitarFila(t.tBodies[0].rows[0].cells[0]);
    expect(t.tBodies.length).toBe(0);
    expect(siguiente!.textContent).toBe('h');
  });

  it('celdaVecina recorre las celdas y pide una fila nueva al final', () => {
    const t = tabla('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
    const [a, b] = Array.from(t.rows[0].cells);
    expect(celdaVecina(a, false)).toBe(b);
    expect(celdaVecina(b, true)).toBe(a);
    expect(celdaVecina(a, true)).toBeNull();
    expect(celdaVecina(b, false)).toBe('nueva-fila');
  });
});
