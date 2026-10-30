import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, DestroyRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { filter, Subscription } from 'rxjs';
import { DialogDenunciarPostComponent } from 'src/app/components/dialogs/dialog-denunciar-post/dialog-denunciar-post.component';
import {
  DialogInteraccionesPostComponent,
  DialogInteraccionesPostData,
} from 'src/app/components/dialogs/dialog-interacciones-post/dialog-interacciones-post.component';
import { DialogRecomendarPostComponent } from 'src/app/components/dialogs/dialog-recomendar-post/dialog-recomendar-post.component';
import { PostDetalle, PostInteracciones, PostVotadoEnVivo } from 'src/app/models/posts/post-vm.model';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { SesionRequeridaService } from 'src/app/services/shared/sesion-requerida.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { enNavegador } from 'src/app/shared/helpers/plataforma';

/** Máximo de opciones en la barra de puntos, aunque el rango permita repartir más por día. */
const MAX_OPCIONES_PUNTOS = 10;

/**
 * Debajo del contenido del post: dar puntos, seguir / favoritos / recomendar / denunciar y las estadísticas.
 * Sin sesión todo se ve, y cualquier acción lleva al login (y vuelve al post).
 */
import { UserPopoverDirective } from 'src/app/shared/directives/userPopover.directive';

@Component({
  selector: 'app-posts-meta',
  templateUrl: './posts-meta.component.html',
  styleUrls: ['./posts-meta.component.scss'],
  imports: [UserPopoverDirective, MatTooltip, DecimalPipe, DatePipe, RouterLink, UserAvatarComponent],
})
export class PostsMetaComponent {
  private readonly securityService = inject(IHttpSecurityService);
  private readonly postService = inject(IHttpPostsService);
  private readonly dialog = inject(MatDialog);
  private readonly sesion = inject(SesionRequeridaService);
  private readonly signalr = inject(SignalrService);
  private readonly destroyRef = inject(DestroyRef);
  private cargaPuntos?: Subscription;
  private cargaInteracciones?: Subscription;
  private ocultarAviso?: ReturnType<typeof setTimeout>;
  /** Post cuyo grupo "post-{id}" escucho en el hub (puntos en vivo). */
  private postEnVivo?: number;

  // Se lee al crear el componente: el setter de `post` corre ANTES de ngOnInit (posts-view lo crea dentro de
  // @if (post)) y, si el usuario se leyera después, la barra de "Dar puntos" nunca se cargaba.
  public readonly currentUser: JwtUserModel = this.securityService.getCurrentUser();

  private _post!: PostDetalle;

  @Input({ required: true }) set post(value: PostDetalle) {
    this._post = value;
    if (value) {
      this.cargarInteracciones();
      this.escucharEnVivo(value.id);
    }
  }

  get post(): PostDetalle {
    return this._post;
  }

  public availablePuntos: number[] = [];
  /** Puntos que me quedan hoy (para "Te quedan X puntos hoy"). */
  public puntosRestantes = 0;
  /** Ya llegó mi estado (voto, favorito, puntos del día): hasta entonces la barra y el favorito muestran un esqueleto. */
  public cargado = false;
  /** Puntos que di (al votar o, si ya había votado, los que llegan del API): la barra se reemplaza por el agradecimiento. */
  public puntosDados = 0;
  public votando = false;
  public enFavoritos = false;
  public yoRecomende = false;
  public procesando: 'seguir' | 'favorito' | null = null;
  public aviso: { texto: string; ok: boolean } | null = null;
  /** Quiénes dieron puntos y quiénes recomendaron (más mi voto y favorito, que llegan en la misma respuesta). */
  public interacciones: PostInteracciones | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.ocultarAviso);
      if (this.postEnVivo) this.signalr.stopPost(this.postEnVivo);
    });

    this.signalr.postVotado$
      .pipe(
        filter((e) => e.postId === this.post?.id),
        takeUntilDestroyed(),
      )
      .subscribe((e) => this.alVotarEnVivo(e));
  }

  get haySesion(): boolean {
    return !!this.currentUser?.usuario;
  }

  get esAutor(): boolean {
    return !!this.currentUser?.usuario && this.currentUser.usuario.userName === this.post?.usuario?.userName;
  }

  iniciarSesion(): void {
    this.sesion.irALogin();
  }

  /** "1 punto" / "N puntos". */
  puntosTexto(n: number): string {
    return `${n} ${n === 1 ? 'punto' : 'puntos'}`;
  }

  private cargarInteracciones(): void {
    this.cargado = !this.haySesion; // sin sesión no hay estado propio que esperar
    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.
    this.cargaInteracciones?.unsubscribe();
    this.cargaInteracciones = this.postService
      .getInteraccionesPost(this.post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((i) => {
        if (!i) {
          // Sin interacciones (error): al menos la barra de puntos, con el pedido de antes.
          this.cargarPuntosDisponibles();
          return;
        }
        this.interacciones = i;
        // Ya votó este post (se vota una vez): en lugar de la barra se muestra cuántos le dio.
        this.puntosDados = i.misPuntos > 0 ? i.misPuntos : 0;
        this.enFavoritos = i.enFavoritos;
        this.yoRecomende = !!i.yoRecomende;
        if (i.puntosDisponibles != null) this.fijarPuntosDisponibles(i.puntosDisponibles);
        this.cargado = true;
      });
  }

  private cargarPuntosDisponibles(): void {
    if (!this.haySesion || this.esAutor) {
      this.cargado = true;
      return;
    }
    this.cargaPuntos?.unsubscribe();
    this.cargaPuntos = this.postService
      .getAvailableVotos(1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (disponibles) => {
          this.fijarPuntosDisponibles(disponibles);
          this.cargado = true;
        },
        error: () => (this.cargado = true),
      });
  }

  private fijarPuntosDisponibles(disponibles: number): void {
    this.puntosRestantes = Math.max(disponibles, 0);
    const maximo = Math.min(this.puntosRestantes, MAX_OPCIONES_PUNTOS);
    this.availablePuntos = Array.from({ length: maximo }, (_, i) => i + 1);
  }

  /** Puntos en vivo: solo en el navegador (en SSR no hay hub). */
  private escucharEnVivo(postId: number): void {
    if (!enNavegador() || this.postEnVivo === postId) return;
    if (this.postEnVivo) this.signalr.stopPost(this.postEnVivo);
    this.postEnVivo = postId;
    this.signalr.startPost(postId);
  }

  private alVotarEnVivo(e: PostVotadoEnVivo): void {
    this.post.puntos = e.puntos;
    if (!this.interacciones || !e.votante?.userName) return;
    // Mi propio voto ya lo agregué al votar: no se duplica.
    if (this.interacciones.votantes.some((v) => v.userName === e.votante.userName)) return;
    this.interacciones = {
      ...this.interacciones,
      totalVotantes: this.interacciones.totalVotantes + 1,
      puntosHoy: (this.interacciones.puntosHoy || 0) + e.votante.cantidad,
      votantes: [e.votante, ...this.interacciones.votantes],
    };
  }

  votarPost(puntos: number): void {
    if (this.votando || !this.sesion.exigir('Inicia sesión para dar puntos')) return;
    this.votando = true;
    const totalAntes = this.post.puntos || 0;
    this.postService
      .setVotos({ typeId: this.post.id, cantidad: puntos, votosType: 1 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ok) => {
          this.votando = false;
          if (!ok) return;
          this.puntosDados = puntos;
          // El servidor avisa "postVotado" (con el total absoluto) antes de responder: si ese aviso ya llegó, el total
          // incluye mi voto y sumar acá lo contaba dos veces. Nunca baja de "lo que había + mis puntos".
          this.post.puntos = Math.max(this.post.puntos || 0, totalAntes + puntos);
          this.fijarPuntosDisponibles(this.puntosRestantes - puntos);
          const yo = this.currentUser.usuario;
          if (this.interacciones && yo?.userName) {
            const yaEstoy = this.interacciones.votantes.some((v) => v.userName === yo.userName);
            this.interacciones = yaEstoy
              ? { ...this.interacciones, misPuntos: puntos } // el aviso en vivo ya me agregó a la lista
              : {
                  ...this.interacciones,
                  misPuntos: puntos,
                  totalVotantes: this.interacciones.totalVotantes + 1,
                  puntosHoy: (this.interacciones.puntosHoy || 0) + puntos,
                  // Me sumo al frente de "Le dieron puntos" sin volver a pedir la lista.
                  votantes: [
                    { userName: yo.userName, avatar: yo.avatar ?? null, cantidad: puntos, fecha: new Date().toISOString() },
                    ...this.interacciones.votantes,
                  ],
                };
          }
        },
        error: () => (this.votando = false),
      });
  }

  /** Optimista: cambia al instante y se revierte si el API falla. */
  seguirPost(): void {
    if (!this.post?.id || this.procesando || !this.sesion.exigir('Inicia sesión para seguir el post')) return;
    const antes = { seguir: !!this.post.seguirPost, seguidores: this.post.seguidores || 0 };
    const revertir = () => {
      this.post.seguirPost = antes.seguir;
      this.post.seguidores = antes.seguidores;
    };

    this.post.seguirPost = !antes.seguir;
    this.post.seguidores = Math.max(0, antes.seguidores + (this.post.seguirPost ? 1 : -1));
    this.procesando = 'seguir';
    this.postService
      .seguirPost(this.post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ok) => {
          this.procesando = null;
          if (!ok) {
            revertir();
            this.mostrarAviso('No pudimos actualizar el seguimiento. Prueba otra vez.', false);
            return;
          }
          this.mostrarAviso(
            this.post.seguirPost ? 'Te avisaremos cuando haya comentarios nuevos.' : 'Dejaste de seguir este post.',
            !!this.post.seguirPost,
          );
        },
        error: () => {
          this.procesando = null;
          revertir();
        },
      });
  }

  /** Agrega o quita de favoritos (un segundo clic lo quita). Optimista; el total real llega del API. */
  alternarFavorito(): void {
    if (this.procesando || !this.sesion.exigir('Inicia sesión para guardar en favoritos')) return;
    const antes = { activo: this.enFavoritos, total: this.post.favoritos || 0 };
    this.enFavoritos = !antes.activo;
    this.post.favoritos = Math.max(0, antes.total + (this.enFavoritos ? 1 : -1));
    this.procesando = 'favorito';
    this.postService
      .alternarFavoritoPost(this.post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.procesando = null;
          this.enFavoritos = r.activo;
          this.post.favoritos = r.total;
          this.mostrarAviso(
            r.activo ? '¡Listo! Lo encuentras en tus favoritos.' : 'Lo quitaste de tus favoritos.',
            r.activo,
          );
        },
        error: () => {
          this.procesando = null;
          this.enFavoritos = antes.activo;
          this.post.favoritos = antes.total;
        },
      });
  }

  recomendarPost(): void {
    if (!this.sesion.exigir('Inicia sesión para recomendar el post')) return;
    if (this.yoRecomende) {
      this.mostrarAviso('Ya recomendaste este post a tus seguidores.', true);
      return;
    }
    this.dialog
      .open(DialogRecomendarPostComponent, { width: '500px', disableClose: true, data: this.post.id })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((recomendado) => {
        if (!recomendado) return;
        this.yoRecomende = true;
        this.cargarInteracciones(); // aparece en "Recomendado por"
      });
  }

  /** El "+N": lista completa de quienes dieron puntos o recomendaron. */
  verTodos(tipo: DialogInteraccionesPostData['tipo']): void {
    this.dialog.open(DialogInteraccionesPostComponent, {
      width: '440px',
      maxHeight: '80vh',
      data: { postId: this.post.id, tipo } satisfies DialogInteraccionesPostData,
    });
  }

  denunciarPost(): void {
    if (!this.sesion.exigir('Inicia sesión para denunciar')) return;
    this.dialog.open(DialogDenunciarPostComponent, { width: '600px', disableClose: true, data: this.post });
  }

  private mostrarAviso(texto: string, ok: boolean): void {
    this.aviso = { texto, ok };
    clearTimeout(this.ocultarAviso);
    this.ocultarAviso = setTimeout(() => (this.aviso = null), 4000);
  }
}
