import { Injectable, signal } from '@angular/core';
import { enNavegador } from '../../shared/helpers/plataforma';

export interface ConfirmarOpciones {
  mensaje: string;
  titulo?: string;
  aceptar?: string;
  cancelar?: string;
  /** Botón rojo e ícono de advertencia. Si no se indica, se deduce del mensaje (eliminar, borrar, abandonar…). */
  peligro?: boolean;
}

export interface PedirTextoOpciones extends ConfirmarOpciones {
  valor?: string;
  placeholder?: string;
  /** Sin texto no se puede aceptar. */
  requerido?: boolean;
  /** Área de varias líneas en lugar de un campo simple. */
  multilinea?: boolean;
}

/** Pedido en pantalla: `conTexto` decide si muestra el campo; `resolver` recibe el texto, '' o null al cancelar. */
export interface PedidoConfirmacion extends PedirTextoOpciones {
  conTexto: boolean;
  resolver: (valor: string | null) => void;
}

const PELIGROSO = /\b(eliminar|borrar|descartar|abandonar|quitar|banear)\b/i;

/**
 * Reemplazo de window.confirm/prompt con el diseño del sitio. Lo dibuja <app-confirmar> (montado una vez en
 * app.component); si se piden varios a la vez se muestran en orden. En el render del servidor no hay a quién
 * preguntar: responde que no.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmarService {
  private readonly activo = enNavegador();
  private readonly cola: PedidoConfirmacion[] = [];
  readonly actual = signal<PedidoConfirmacion | null>(null);

  confirmar(opciones: ConfirmarOpciones | string): Promise<boolean> {
    const o = typeof opciones === 'string' ? { mensaje: opciones } : opciones;
    return this.encolar({ ...o, conTexto: false }).then((valor) => valor !== null);
  }

  /** Devuelve el texto escrito (sin espacios de los bordes) o null si se canceló. */
  pedirTexto(opciones: PedirTextoOpciones | string): Promise<string | null> {
    const o = typeof opciones === 'string' ? { mensaje: opciones } : opciones;
    return this.encolar({ ...o, conTexto: true });
  }

  /** Lo llama el componente al cerrar el diálogo. */
  responder(valor: string | null): void {
    const pedido = this.actual();
    if (!pedido) return;
    this.actual.set(this.cola.shift() ?? null);
    pedido.resolver(valor);
  }

  private encolar(pedido: Omit<PedidoConfirmacion, 'resolver'>): Promise<string | null> {
    if (!this.activo) return Promise.resolve(null);

    return new Promise((resolver) => {
      const completo: PedidoConfirmacion = { ...pedido, peligro: pedido.peligro ?? PELIGROSO.test(pedido.mensaje), resolver };
      if (this.actual()) {
        this.cola.push(completo);
      } else {
        this.actual.set(completo);
      }
    });
  }
}
