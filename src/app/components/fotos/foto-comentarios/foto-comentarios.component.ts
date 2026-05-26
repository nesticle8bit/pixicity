import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-foto-comentarios',
  templateUrl: './foto-comentarios.component.html',
  styleUrls: ['./foto-comentarios.component.scss'],
})
export class FotoComentariosComponent implements OnInit {
  private _fotoId: number = 0;

  @Input() set fotoId(value: number) {
    this._fotoId = value;
    if (value) this.loadComentarios();
  }
  get fotoId(): number { return this._fotoId; }

  public comentarios: any[] = [];
  public currentUser: any;
  public formGroup: FormGroup;
  public lastComment: string = '';

  constructor(
    private fotosService: IHttpFotosService,
    private securityService: IHttpSecurityService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.formGroup = this.fb.group({ contenido: ['', Validators.required] });
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  loadComentarios(): void {
    this.fotosService.getComentariosByFotoId(this._fotoId).subscribe((data: any) => {
      this.comentarios = data || [];
    });
  }

  enviarComentario(): void {
    if (this.formGroup.invalid) return;
    const payload = { fotoId: this._fotoId, contenido: this.formGroup.value.contenido };
    this.fotosService.addComentario(payload).subscribe((id: any) => {
      if (id) {
        this.comentarios.push({
          id,
          fotoId: this._fotoId,
          usuario: this.currentUser.usuario.userName,
          avatar: this.currentUser.usuario.avatar,
          contenido: payload.contenido,
          fechaComentario: new Date(),
          votos: 0,
        });
        this.formGroup.reset();
      }
    });
  }

  eliminarComentario(comentario: any, index: number): void {
    if (this.notificationService.confirm('¿Eliminar este comentario?')) {
      this.fotosService.deleteComentario(comentario.id).subscribe(() => {
        this.comentarios.splice(index, 1);
      });
    }
  }

  voteComentario(comentario: any, cantidad: number): void {
    this.fotosService.votarComentario(comentario.id, cantidad).subscribe((res: any) => {
      if (res) {
        comentario.votos = res.votos;
        comentario.miVoto = res.miVoto;
      }
    });
  }

  updateComentario(comentario: any): void {
    if (!comentario.contenido) return;
    // Simple optimistic update — no dedicated endpoint needed for now
    comentario.update = false;
  }
}
