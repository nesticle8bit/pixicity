import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import Swal from 'sweetalert2';

@Component({
  standalone: false,
  selector: 'app-shouts-comments',
  templateUrl: './shouts-comments.component.html',
  styleUrls: ['./shouts-comments.component.scss'],
})
export class ShoutsCommentsComponent implements OnInit {
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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  loadComentarios(): void {
    this.perfilService.getComentariosByShoutId(this._shout.id).subscribe((data: any[]) => {
      this.comentarios = data || [];
    });
  }

  enviarComentario(): void {
    if (!this.nuevoComentario?.trim()) return;

    this.enviando = true;
    this.perfilService
      .addShoutComentario({ shoutId: this._shout.id, comentario: this.nuevoComentario.trim() })
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
    Swal.fire({
      title: 'Eliminar comentario',
      text: '¿Seguro que deseas eliminar este comentario?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.perfilService.deleteShoutComentario(id).subscribe(() => {
          this.comentarios = this.comentarios.filter((c) => c.id !== id);
          this.snackBar.open('Comentario eliminado', '', { duration: 2000 });
        });
      }
    });
  }

  esMio(comentario: any): boolean {
    return (
      this.currentUser?.usuario?.userName === comentario.usuario ||
      this.currentUser?.usuario?.isAdmin
    );
  }
}
