// Operaciones de tabla del editor sobre el DOM, sin estado: cada una devuelve la celda donde debe quedar el caret.
// El componente se encarga de la selección, el historial y la barra contextual.

export function nuevaCelda(tag: 'td' | 'th', texto = ''): HTMLTableCellElement {
  const celda = document.createElement(tag);
  celda.appendChild(texto ? document.createTextNode(texto) : document.createElement('br'));
  return celda;
}

/** Tabla con una fila de encabezado ("Columna N") y `filas - 1` filas vacías. */
export function crearTabla(filas: number, columnas: number): HTMLTableElement {
  const tabla = document.createElement('table');
  const encabezado = tabla.createTHead().insertRow();
  for (let c = 0; c < columnas; c++) encabezado.appendChild(nuevaCelda('th', `Columna ${c + 1}`));
  const cuerpo = tabla.createTBody();
  for (let r = 1; r < filas; r++) {
    const tr = cuerpo.insertRow();
    for (let c = 0; c < columnas; c++) tr.appendChild(nuevaCelda('td'));
  }
  return tabla;
}

/** Celda donde empezar a escribir en una tabla recién creada: la primera del cuerpo (o del encabezado si no hay cuerpo). */
export function celdaInicial(tabla: HTMLTableElement): HTMLTableCellElement {
  return tabla.rows[tabla.rows.length > 1 ? 1 : 0].cells[0];
}

export function agregarFila(celda: HTMLTableCellElement): HTMLTableCellElement {
  const fila = celda.parentElement as HTMLTableRowElement;
  const tabla = fila.closest('table')!;
  const tr = document.createElement('tr');
  for (let c = 0; c < fila.cells.length; c++) tr.appendChild(nuevaCelda('td'));
  // Una fila nueva bajo el encabezado va al principio del cuerpo
  if (fila.parentElement?.tagName === 'THEAD') (tabla.tBodies[0] ?? tabla.createTBody()).prepend(tr);
  else fila.after(tr);
  return tr.cells[Math.min(celda.cellIndex, tr.cells.length - 1)];
}

export function agregarColumna(celda: HTMLTableCellElement): HTMLTableCellElement {
  const indice = celda.cellIndex;
  Array.from(celda.closest('table')!.rows).forEach((tr) => {
    const nueva = nuevaCelda(tr.parentElement?.tagName === 'THEAD' ? 'th' : 'td');
    const ref = tr.cells[indice];
    if (ref) ref.after(nueva);
    else tr.appendChild(nueva);
  });
  return celda.nextElementSibling as HTMLTableCellElement;
}

/** Quita la fila de `celda`. null si es la única: en ese caso hay que borrar la tabla entera. */
export function quitarFila(celda: HTMLTableCellElement): HTMLTableCellElement | null {
  const fila = celda.parentElement as HTMLTableRowElement;
  const tabla = fila.closest('table')!;
  if (tabla.rows.length <= 1) return null;
  const seccion = fila.parentElement!;
  const indice = celda.cellIndex;
  const indiceFila = fila.rowIndex;
  fila.remove();
  if (!seccion.children.length) seccion.remove();
  const siguiente = tabla.rows[Math.min(indiceFila, tabla.rows.length - 1)];
  return siguiente.cells[Math.min(indice, siguiente.cells.length - 1)];
}

/** Quita la columna de `celda`. null si es la única: en ese caso hay que borrar la tabla entera. */
export function quitarColumna(celda: HTMLTableCellElement): HTMLTableCellElement | null {
  const fila = celda.parentElement as HTMLTableRowElement;
  if (fila.cells.length <= 1) return null;
  const indice = celda.cellIndex;
  Array.from(celda.closest('table')!.rows).forEach((tr) => tr.cells[indice]?.remove());
  return fila.cells[Math.min(indice, fila.cells.length - 1)];
}

/**
 * Tab / Shift+Tab: celda siguiente o anterior. 'nueva-fila' si es Tab en la última celda (hay que agregar una fila);
 * null si es Shift+Tab en la primera (el caret no se mueve).
 */
export function celdaVecina(celda: HTMLTableCellElement, atras: boolean): HTMLTableCellElement | 'nueva-fila' | null {
  const celdas = Array.from(celda.closest('table')!.querySelectorAll<HTMLTableCellElement>('th, td'));
  const i = celdas.indexOf(celda);
  if (atras) return i > 0 ? celdas[i - 1] : null;
  return i < celdas.length - 1 ? celdas[i + 1] : 'nueva-fila';
}
