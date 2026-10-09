import { Component, DestroyRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ShoutComentarioViewModel, ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';
import { ComentarioHilo, ComentariosAcciones } from 'src/app/models/shared/comentario-hilo.model';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { ComentariosComponent } from '../../../shared/comentarios/comentarios.component';

/** Convierte un comentario de shout al formato común de <app-comentarios>. */
function aHilo(c: ShoutComentarioViewModel): ComentarioHilo {
  return {
    id: c.id,
    parentId: c.parentId ?? null,
    contenido: c.comentario,
    fecha: c.fechaRegistro,
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

/** Comentarios de un shout: carga los datos del API de shouts y los muestra con <app-comentarios>. */
@Component({
    selector: 'app-shouts-comments',
    templateUrl: './shouts-comments.component.html',
    imports: [ComentariosComponent],
})
export class ShoutsCommentsComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly perfilService = inject(IHttpPerfilService);
  private readonly securityService = inject(IHttpSecurityService);

  private _shout: ShoutViewModel | null = null;

  public comentarios: ComentarioHilo[] = [];
  /** La vista del shout lo muestra en su cabecera. */
  public totalComentarios = 0;

  @Input() set shout(value: ShoutViewModel | null) {
    const cambio = value?.id !== this._shout?.id;
    this._shout = value;
    if (cambio) {
      this.cargar();
    }
  }

  get shout(): ShoutViewModel | null {
    return this._shout;
  }

  public readonly acciones: ComentariosAcciones = {
    comentar: (contenido, parentId) =>
      this.perfilService.addShoutComentario({ shoutId: this._shout!.id, comentario: contenido, parentId: parentId ?? undefined }),
    editar: (id, contenido) => this.perfilService.editarShoutComentario(id, contenido),
    eliminar: (id) => this.perfilService.deleteShoutComentario(id),
    votar: (id, valor) => this.perfilService.votarShoutComentario(id, valor),
    fijar: (id) => this.perfilService.fijarShoutComentario(id),
    denunciar: (id, motivo) => this.perfilService.denunciarShoutComentario(id, motivo),
  };

  /** Autor del shout: fija y borra comentarios en su publicación. */
  get autor(): string | null {
    return this._shout?.avatar?.userName ?? null;
  }

  get esAutorShout(): boolean {
    const yo = this.securityService.getCurrentUser()?.usuario?.userName;
    return !!yo && yo === this.autor;
  }

  get puedeFijar(): boolean {
    const rango = this.securityService.getCurrentUser()?.usuario?.rango;
    return this.esAutorShout || rango === 'Administrador' || rango === 'Moderador';
  }

  private cargar(): void {
    if (!this._shout?.id) {
      this.comentarios = [];
      this.totalComentarios = 0;
      return;
    }

    this.perfilService
      .getComentariosByShoutId(this._shout.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lista) => {
        this.comentarios = (lista ?? []).map(aHilo);
        this.totalComentarios = this.comentarios.length;
      });
  }
}
