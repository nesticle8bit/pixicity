import { Component, DestroyRef, inject, Input, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FotoComentarioViewModel } from 'src/app/models/fotos/foto-vm.model';
import { ComentarioHilo, ComentariosAcciones } from 'src/app/models/shared/comentario-hilo.model';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { ComentariosComponent } from '../../shared/comentarios/comentarios.component';

/** Convierte un comentario de foto al formato común de <app-comentarios>. */
function aHilo(c: FotoComentarioViewModel): ComentarioHilo {
  return {
    id: c.id,
    parentId: c.parentId ?? null,
    contenido: c.contenido,
    fecha: c.fechaComentario,
    fechaEdicion: c.fechaActualiza ?? null,
    userName: c.usuario,
    avatar: c.avatar,
    rango: c.rango ? { nombre: c.rango.nombre, color: c.rango.color, icono: c.rango.icono } : null,
    votos: c.votos ?? 0,
    miVoto: c.miVoto ?? 0,
    votosArriba: c.votosArriba ?? 0,
    votosAbajo: c.votosAbajo ?? 0,
    fijado: !!c.fijado,
    denunciasPendientes: c.denunciasPendientes ?? 0,
  };
}

/** Comentarios de una foto: carga los datos del API de fotos y los muestra con <app-comentarios>. */
@Component({
    selector: 'app-foto-comentarios',
    templateUrl: './foto-comentarios.component.html',
    imports: [ComentariosComponent],
})
export class FotoComentariosComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fotosService = inject(IHttpFotosService);
  private readonly securityService = inject(IHttpSecurityService);

  private _fotoId = 0;

  public comentarios: ComentarioHilo[] = [];

  @Input() set fotoId(value: number) {
    if (value === this._fotoId) return;
    this._fotoId = value;
    this.cargar();
  }

  get fotoId(): number {
    return this._fotoId;
  }

  /** Autor de la foto: puede fijar y borrar comentarios, y los suyos llevan la marca "OP". */
  readonly autor = input<string | null>(null);

  /** Cambió la cantidad de comentarios. */
  readonly totalCambio = output<number>();

  public readonly acciones: ComentariosAcciones = {
    comentar: (contenido, parentId) => this.fotosService.addComentario({ fotoId: this._fotoId, contenido, parentId }),
    editar: (id, contenido) => this.fotosService.editarComentario(id, contenido),
    eliminar: (id) => this.fotosService.deleteComentario(id),
    votar: (id, valor) => this.fotosService.votarComentario(id, valor),
    fijar: (id) => this.fotosService.fijarComentario(id),
    denunciar: (id, motivo) => this.fotosService.denunciarComentario(id, motivo),
  };

  get esAutorFoto(): boolean {
    const yo = this.securityService.getCurrentUser()?.usuario?.userName;
    return !!yo && yo === this.autor();
  }

  get puedeFijar(): boolean {
    const rango = this.securityService.getCurrentUser()?.usuario?.rango;
    return this.esAutorFoto || rango === 'Administrador' || rango === 'Moderador';
  }

  private cargar(): void {
    if (!this._fotoId) {
      this.comentarios = [];
      return;
    }

    this.fotosService
      .getComentariosByFotoId(this._fotoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lista) => (this.comentarios = (lista ?? []).map(aHilo)));
  }
}
