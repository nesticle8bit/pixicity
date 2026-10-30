import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { UserAvatarComponent } from 'src/app/components/addons/user-avatar/user-avatar.component';
import { TimeAgoPipe } from 'src/app/shared/pipes/timeAgo.pipe';
import { PostInteraccionUsuario } from 'src/app/models/posts/post-vm.model';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';

export interface DialogInteraccionesPostData {
  postId: number;
  tipo: 'votos' | 'recomendaciones';
}

/** Lista completa de quienes dieron puntos o recomendaron un post (el "+N" de posts-meta), con "Ver más". */
@Component({
  selector: 'app-dialog-interacciones-post',
  templateUrl: './dialog-interacciones-post.component.html',
  styleUrls: ['./dialog-interacciones-post.component.scss'],
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, RouterLink, UserAvatarComponent, DatePipe, DecimalPipe, TimeAgoPipe, MatTooltip],
})
export class DialogInteraccionesPostComponent implements OnInit {
  readonly data = inject<DialogInteraccionesPostData>(MAT_DIALOG_DATA);
  private readonly postService = inject(IHttpPostsService);
  private readonly destroyRef = inject(DestroyRef);

  items: PostInteraccionUsuario[] = [];
  total = 0;
  cargando = false;
  private pagina = 0;

  get esVotos(): boolean {
    return this.data.tipo === 'votos';
  }

  get hayMas(): boolean {
    return this.items.length < this.total;
  }

  ngOnInit(): void {
    this.cargarMas();
  }

  cargarMas(): void {
    if (this.cargando) return;
    this.cargando = true;
    this.postService
      .getInteraccionesPostPagina(this.data.postId, this.data.tipo, this.pagina + 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => {
        this.cargando = false;
        this.pagina++;
        this.total = r.total;
        // Si entre página y página votó alguien, la siguiente repite al último: se descarta.
        const vistos = new Set(this.items.map((i) => i.userName));
        this.items = [...this.items, ...r.items.filter((i) => !vistos.has(i.userName))];
        if (!r.items.length) this.total = this.items.length;
      });
  }
}
