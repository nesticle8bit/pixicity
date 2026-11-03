import { Injectable, signal } from '@angular/core';
import { ShoutInteracciones } from 'src/app/models/perfil/shout-vm.model';

/**
 * Último estado conocido de cada shout en esta pestaña (me gusta, favorito, reshout, comentarios).
 * Las listas (/mi, perfil) guardan los shouts como vinieron del API: al volver con "atrás" se restauran tal cual.
 * Sin esto, lo que se tocó en la tarjeta o en la página del shout no se vería al volver.
 */
@Injectable({ providedIn: 'root' })
export class ShoutsEstadoService {
  private readonly cambios = signal<ReadonlyMap<number, Partial<ShoutInteracciones>>>(new Map());

  /** Lo que se sabe de este shout desde que llegó la lista (vacío si nada). Lee la señal: una tarjeta se entera. */
  de(id: number): Partial<ShoutInteracciones> {
    return this.cambios().get(id) ?? {};
  }

  actualizar(id: number, parcial: Partial<ShoutInteracciones>): void {
    this.cambios.update((m) => new Map(m).set(id, { ...m.get(id), ...parcial }));
  }

  /** Comentario nuevo (+1) o borrado (-1); `base` es el total que se conocía si todavía no hay nada guardado. */
  sumarComentarios(id: number, delta: number, base = 0): void {
    const actual = this.cambios().get(id)?.comentarios ?? base;
    this.actualizar(id, { comentarios: Math.max(0, actual + delta) });
  }
}
