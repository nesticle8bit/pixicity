import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-shouts-comments',
  templateUrl: './shouts-comments.component.html',
  styleUrls: ['./shouts-comments.component.scss'],
})
export class ShoutsCommentsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  private _shout: any;

  comentarios: any[] = [];
  nuevoComentario: string = '';
  enviando: boolean = false;
  currentUser: any;

  @Input() set shout(value: any) {
    this._shout = value;
    if (value?.id) {
      this.loadComentarios();
    }
  }

  get shout(): any {
    return this._shout;
  }

  constructor(
    private perfilService: IHttpPerfilService,
    private securityService: IHttpSecurityService,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  loadComentarios(): void {
    this.perfilService.getComentariosByShoutId(this._shout.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: any[]) => {
      this.comentarios = data || [];
    });
  }

  enviarComentario(): void {
    if (!this.nuevoComentario?.trim()) return;

    this.enviando = true;
    this.perfilService
      .addShoutComentario({ shoutId: this._shout.id, comentario: this.nuevoComentario.trim() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.nuevoComentario = '';
          this.enviando = false;
          this.loadComentarios();
        },
        error: () => {
          this.enviando = false;
        },
      });
  }

  eliminarComentario(id: number): void {
    if (!this.notificationService.confirm('¿Seguro que deseas eliminar este comentario?')) {
      return;
    }

    this.perfilService.deleteShoutComentario(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.comentarios = this.comentarios.filter((c) => c.id !== id);
      this.snackBar.open('Comentario eliminado', '', { duration: 2000 });
    });
  }

  esMio(comentario: any): boolean {
    return (
      this.currentUser?.usuario?.userName === comentario.usuario ||
      this.currentUser?.usuario?.isAdmin
    );
  }
}
