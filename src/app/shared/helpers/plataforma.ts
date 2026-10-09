/**
 * true en el navegador, false en el render del servidor (SSR para bots), donde no existen window, document
 * global, scroll ni temporizadores largos. Úsalo para listeners, intervalos y APIs del navegador que corren al
 * crear un componente o servicio. (Para el DOM, preferir inject(DOCUMENT), que sí existe en el servidor.)
 */
export function enNavegador(): boolean {
  return typeof window !== 'undefined';
}
