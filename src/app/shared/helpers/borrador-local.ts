import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

const PREFIJO = 'taringas:borrador:';
const VIGENCIA_MS = 30 * 24 * 60 * 60 * 1000;

export interface BorradorGuardado<T> {
  valor: T;
  fecha: number;
}

// localStorage puede no existir (SSR) o fallar (modo privado, cuota llena): nunca debe romper el formulario.
function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/**
 * Borrador automático de un formulario en localStorage: se guarda mientras se escribe y, si al volver hay uno
 * distinto de lo que muestra el formulario, queda en `pendiente` para ofrecer recuperarlo.
 *
 *   this.borrador = new BorradorLocal(`post:${id || 'nuevo'}`, usuario, this.formGroup, this.destroyRef);
 *   this.borrador.iniciar();          // después de cargar los valores iniciales
 *   this.borrador.limpiar();          // al publicar
 */
export class BorradorLocal<T extends Record<string, unknown> = Record<string, unknown>> {
  pendiente: BorradorGuardado<T> | null = null;

  private readonly clave: string;
  private iniciado = false;

  constructor(
    clave: string,
    usuario: string | null | undefined,
    private readonly form: FormGroup,
    private readonly destroyRef: DestroyRef,
    // Campos que vale la pena guardar; si alguno tiene texto, hay borrador.
    private readonly camposConTexto: string[] = ['titulo', 'contenido'],
  ) {
    this.clave = `${PREFIJO}${usuario || 'anonimo'}:${clave}`;
  }

  /** Revisa si hay un borrador previo y empieza a guardar los cambios. Llamar una sola vez. */
  iniciar(): void {
    if (this.iniciado) {
      return;
    }
    this.iniciado = true;

    const previo = this.leer();
    if (previo && JSON.stringify(previo.valor) !== JSON.stringify(this.form.getRawValue())) {
      this.pendiente = previo;
    }

    this.form.valueChanges.pipe(debounceTime(800), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      // Solo lo que escribió la persona (no los valores cargados al editar) y mientras no decida sobre el anterior.
      if (this.form.dirty && !this.pendiente) {
        this.guardar();
      }
    });
  }

  recuperar(): void {
    if (!this.pendiente) {
      return;
    }
    this.form.patchValue(this.pendiente.valor);
    this.form.markAsDirty();
    this.pendiente = null;
  }

  descartar(): void {
    this.pendiente = null;
    this.limpiar();
  }

  limpiar(): void {
    storage()?.removeItem(this.clave);
  }

  private guardar(): void {
    const valor = this.form.getRawValue() as T;
    const conTexto = this.camposConTexto.some((c) => this.textoPlano(valor[c]).length > 0);
    try {
      if (conTexto) {
        storage()?.setItem(this.clave, JSON.stringify({ valor, fecha: Date.now() } satisfies BorradorGuardado<T>));
      } else {
        this.limpiar();
      }
    } catch {
      // cuota llena: se ignora
    }
  }

  private leer(): BorradorGuardado<T> | null {
    try {
      const raw = storage()?.getItem(this.clave);
      if (!raw) {
        return null;
      }
      const data = JSON.parse(raw) as BorradorGuardado<T>;
      if (!data?.valor || Date.now() - data.fecha > VIGENCIA_MS) {
        this.limpiar();
        return null;
      }
      return data;
    } catch {
      this.limpiar();
      return null;
    }
  }

  private textoPlano(valor: unknown): string {
    return typeof valor === 'string' ? valor.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : '';
  }
}
