import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, DestroyRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { DialogDenunciarPostComponent } from 'src/app/components/dialogs/dialog-denunciar-post/dialog-denunciar-post.component';
import { DialogRecomendarPostComponent } from 'src/app/components/dialogs/dialog-recomendar-post/dialog-recomendar-post.component';
import { PostDetalle, PostInteracciones } from 'src/app/models/posts/post-vm.model';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { SesionRequeridaService } from 'src/app/services/shared/sesion-requerida.service';

/** Máximo de opciones en la barra de puntos, aunque el rango permita repartir más por día. */
const MAX_OPCIONES_PUNTOS = 10;

/**
 * Debajo del contenido del post: dar puntos, seguir / favoritos / recomendar / denunciar y las estadísticas.
 * Sin sesión todo se ve, y cualquier acción lleva al login (y vuelve al post).
 */
@Component({
  selector: 'app-posts-meta',
  templateUrl: './posts-meta.component.html',
  styleUrls: ['./posts-meta.component.scss'],
  imports: [MatTooltip, DecimalPipe, DatePipe, RouterLink, UserAvatarComponent],
})
export class PostsMetaComponent {
  private readonly securityService = inject(IHttpSecurityService);
  private readonly postService = inject(IHttpPostsService);
  private readonly dialog = inject(MatDialog);
  private readonly sesion = inject(SesionRequeridaService);
  private readonly destroyRef = inject(DestroyRef);
  private cargaPuntos?: Subscription;
  private ocultarAviso?: ReturnType<typeof setTimeout>;

  // Se lee al crear el componente: el setter de `post` corre ANTES de ngOnInit (posts-view lo crea dentro de
  // @if (post)) y, si el usuario se leyera después, la barra de "Dar puntos" nunca se cargaba.
  public readonly currentUser: JwtUserModel = this.securityService.getCurrentUser();

  private _post!: PostDetalle;

  @Input({ required: true }) set post(value: PostDetalle) {
    this._post = value;
    if (value) {
      this.cargarInteracciones();
      this.cargarPuntosDisponibles();
    }
  }

  get post(): PostDetalle {
    return this._post;
  }

  public availablePuntos: number[] = [];
  public puntosCargados = false;
  /** Puntos que acaba de dar (la barra se reemplaza por el agradecimiento). */
  public puntosDados = 0;
  public votando = false;
  public enFavoritos = false;
  public procesando: 'seguir' | 'favorito' | null = null;
  public aviso: { texto: string; ok: boolean } | null = null;
  /** Quiénes dieron puntos y quiénes recomendaron (más mi voto y favorito, que llegan en la misma respuesta). */
  public interacciones: PostInteracciones | null = null;
  private cargaInteracciones?: Subscription;

  get haySesion(): boolean {
    return !!this.currentUser?.usuario;
  }

  get esAutor(): boolean {
    return !!this.currentUser?.usuario && this.currentUser.usuario.userName === this.post?.usuario?.userName;
  }

  iniciarSesion(): void {
    this.sesion.irALogin();
  }

  private cargarInteracciones(): void {
    this.cargaInteracciones?.unsubscribe();
    this.cargaInteracciones = this.postService
      .getInteraccionesPost(this.post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((i) => {
        if (!i) return;
        this.interacciones = i;
        // Ya votó este post (se vota una vez): en lugar de la barra se muestra cuántos le dio.
        if (i.misPuntos > 0) this.puntosDados = i.misPuntos;
        this.enFavoritos = i.enFavoritos;
      });
  }

  private cargarPuntosDisponibles(): void {
    if (!this.haySesion || this.esAutor) return;

    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.
    this.cargaPuntos?.unsubscribe();
    this.cargaPuntos = this.postService
      .getAvailableVotos(1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((disponibles) => {
        const maximo = Math.min(Math.max(disponibles, 0), MAX_OPCIONES_PUNTOS);
        this.availablePuntos = Array.from({ length: maximo }, (_, i) => i + 1);
        this.puntosCargados = true;
      });
  }

  votarPost(puntos: number): void {
    if (this.votando || !this.sesion.exigir('Inicia sesión para dar puntos')) return;
    this.votando = true;
    this.postService
      .setVotos({ typeId: this.post.id, cantidad: puntos, votosType: 1 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ok) => {
          this.votando = false;
          if (ok) {
            this.puntosDados = puntos;
            this.post.puntos = (this.post.puntos || 0) + puntos;
            // Me sumo al frente de "Dieron puntos" sin volver a pedir la lista.
            const yo = this.currentUser.usuario;
            if (this.interacciones && yo?.userName) {
              this.interacciones = {
                ...this.interacciones,
                misPuntos: puntos,
                totalVotantes: this.interacciones.totalVotantes + 1,
                votantes: [
                  { userName: yo.userName, avatar: yo.avatar ?? null, cantidad: puntos, fecha: new Date().toISOString() },
                  ...this.interacciones.votantes,
                ],
              };
            }
          }
        },
        error: () => (this.votando = false),
      });
  }

  seguirPost(): void {
    if (!this.post?.id || this.procesando || !this.sesion.exigir('Inicia sesión para seguir el post')) return;
    this.procesando = 'seguir';
    this.postService
      .seguirPost(this.post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ok) => {
          this.procesando = null;
          if (!ok) return;
          this.post.seguirPost = !this.post.seguirPost;
          this.post.seguidores = Math.max(0, (this.post.seguidores || 0) + (this.post.seguirPost ? 1 : -1));
          this.mostrarAviso(
            this.post.seguirPost ? 'Te avisaremos cuando haya comentarios nuevos.' : 'Dejaste de seguir este post.',
            this.post.seguirPost,
          );
        },
        error: () => (this.procesando = null),
      });
  }

  /** Agrega o quita de favoritos (un segundo clic lo quita). */
  alternarFavorito(): void {
    if (this.procesando || !this.sesion.exigir('Inicia sesión para guardar en favoritos')) return;
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
        error: () => (this.procesando = null),
      });
  }

  recomendarPost(): void {
    if (!this.sesion.exigir('Inicia sesión para recomendar el post')) return;
    this.dialog
      .open(DialogRecomendarPostComponent, { width: '500px', disableClose: true, data: this.post.id })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((recomendado) => {
        if (recomendado) this.cargarInteracciones(); // aparece en "Recomendado por"
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
    this.destroyRef.onDestroy(() => clearTimeout(this.ocultarAviso));
  }
}
