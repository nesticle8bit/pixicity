import { Subscription } from 'rxjs';
import { PerfilRef, SIN_PERFIL } from 'src/app/models/seguridad/seguridad-vm.model';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { Component, DestroyRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { IHttpComentariosPostService } from '../../../services/interfaces/httpComentariosPost.interface';
import { ComentarioViewModel } from 'src/app/models/posts/post-vm.model';

/** Pestaña Comentarios del perfil: los últimos comentarios en posts, con enlace directo a cada uno. */
@Component({
  selector: 'app-profile-comments',
  templateUrl: './profile-comments.component.html',
  styleUrls: ['./profile-comments.component.scss'],
  imports: [RouterLink, MatPaginator, TimeAgoPipe, DecimalPipe],
})
export class ProfileCommentsComponent {
  paginationService = inject(PaginationService);
  private comentariosPostService = inject(IHttpComentariosPostService);
  private readonly destroyRef = inject(DestroyRef);
  private carga?: Subscription;

  private _user: PerfilRef = SIN_PERFIL;

  @Input() set user(value: PerfilRef | null) {
    this._user = value ?? SIN_PERFIL;

    // Sin id todavía (el padre arranca con {}): no pedir datos de usuarioId=undefined.
    if (value?.id) {
      this.getCommentsByUserId();
    }
  }

  get user(): PerfilRef {
    return this._user;
  }

  public comments: ComentarioViewModel[] = [];
  public totalCount = 0;
  public cargado = false;

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
  }

  /** El contenido guardado puede traer HTML (formato, menciones): el extracto es solo texto. */
  extracto(contenido: string): string {
    return (contenido ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  }

  getCommentsByUserId(): void {
    if (!this.user.id) {
      return;
    }

    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.
    this.carga?.unsubscribe();
    this.carga = this.comentariosPostService
      .getComentariosByUserId(this.user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        // Sin el post (borrado) no hay a dónde enlazar.
        this.comments = (response?.data ?? []).filter((c) => !!c.post?.categoria);
        this.totalCount = response?.pagination?.totalCount ?? 0;
        this.cargado = true;
      });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getCommentsByUserId();
  }
}
