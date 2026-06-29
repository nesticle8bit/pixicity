import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

const UMBRAL_COLAPSO = -5;
const UMBRAL_DENUNCIAS = 3;
const MOTIVOS_DENUNCIA = ['Spam o publicidad', 'Contenido ofensivo', 'Acoso', 'Información falsa', 'Contenido sexual', 'Otro'];

@Component({
  standalone: false,
  selector: 'app-shouts-comments',
  templateUrl: './shouts-comments.component.html',
  styleUrls: ['./shouts-comments.component.scss'],
})
export class ShoutsCommentsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  private _shout: any;

  public comentarios: any[] = [];
  public arbol: any[] = [];
  public nuevoComentario: string = '';
  public enviando: boolean = false;
  public currentUser: any;

  public orden: 'mejores' | 'recientes' | 'controvertido' = 'mejores';

  public replyTo: number | null = null;
  public replyText: string = '';
  public replyEnviando: boolean = false;

  public editId: number | null = null;
  public editText: string = '';
  public editEnviando: boolean = false;

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
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
  }

  // ---------------------------------------------------------------- Carga / árbol

  loadComentarios(): void {
    this.perfilService.getComentariosByShoutId(this._shout.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: any[]) => {
      this.comentarios = data || [];
      this.construirArbol();
    });
  }

  construirArbol(): void {
    const flat: any[] = this.comentarios ?? [];
    const roots = flat.filter((c) => !c.parentId);
    const hijos = new Map<number, any[]>();

    for (const c of flat) {
      if (c.parentId) {
        const arr = hijos.get(c.parentId) ?? [];
        arr.push(c);
        hijos.set(c.parentId, arr);
      }
    }

    for (const r of roots) {
      r.respuestas = (hijos.get(r.id) ?? [])
        .sort((a, b) => new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime());
    }

    if (this.orden === 'mejores') {
      roots.sort((a, b) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0)
        || (b.votos || 0) - (a.votos || 0)
        || new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());
    } else if (this.orden === 'controvertido') {
      roots.sort((a, b) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0)
        || this.controversia(b) - this.controversia(a)
        || this.totalVotos(b) - this.totalVotos(a)
        || new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());
    } else {
      roots.sort((a, b) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0)
        || new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());
    }

    roots.forEach((r) => (r.destacado = false));
    const top = roots.reduce((best, r) => ((r.votos || 0) > (best?.votos || 0) ? r : best), null as any);
    if (top && (top.votos || 0) >= 3) top.destacado = true;

    this.arbol = roots;
  }

  cambiarOrden(o: 'mejores' | 'recientes' | 'controvertido'): void {
    if (this.orden === o) return;
    this.orden = o;
    this.construirArbol();
  }

  private controversia(c: any): number {
    return Math.min(c.votosArriba || 0, c.votosAbajo || 0);
  }

  private totalVotos(c: any): number {
    return (c.votosArriba || 0) + (c.votosAbajo || 0);
  }

  get totalComentarios(): number {
    return this.comentarios?.length ?? 0;
  }

  // ---------------------------------------------------------------- Permisos / estado

  get logueado(): boolean {
    return !!this.currentUser?.usuario;
  }

  get esAdmin(): boolean {
    const rango = this.currentUser?.usuario?.rango;
    return rango === 'Administrador' || rango === 'Moderador';
  }

  esComentarioPropio(c: any): boolean {
    return c?.usuario === this.currentUser?.usuario?.userName;
  }

  puedeModerar(c: any): boolean {
    return this.logueado && (this.esComentarioPropio(c) || this.esAdmin);
  }

  estaColapsado(c: any): boolean {
    if (c._mostrar) return false;
    return (c.votos || 0) <= UMBRAL_COLAPSO || (c.denunciasPendientes || 0) >= UMBRAL_DENUNCIAS;
  }

  get esDueñoShout(): boolean {
    return this._shout?.avatar?.userName === this.currentUser?.usuario?.userName;
  }

  puedeFijar(c: any): boolean {
    if (c?.parentId) return false;
    return this.esDueñoShout || this.esAdmin;
  }

  mostrarColapsado(c: any): void {
    c._mostrar = true;
  }

  // ---------------------------------------------------------------- Acciones

  enviarComentario(): void {
    if (!this.nuevoComentario?.trim() || this.enviando) return;

    this.enviando = true;
    const texto = this.nuevoComentario.trim();

    this.perfilService.addShoutComentario({ shoutId: this._shout.id, comentario: texto })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (nuevoId: any) => {
          this.comentarios.push(this.crearLocal(nuevoId, texto, null));
          this.nuevoComentario = '';
          this.enviando = false;
          this.construirArbol();
        },
        error: () => { this.enviando = false; },
      });
  }

  responder(c: any): void {
    if (!this.logueado) {
      this.notificationService.warning('Inicia sesión para responder', 'Shouts');
      return;
    }
    this.replyTo = c.id;
    this.replyText = '';
  }

  cancelarRespuesta(): void {
    this.replyTo = null;
    this.replyText = '';
  }

  enviarRespuesta(c: any): void {
    if (!this.replyText?.trim() || this.replyEnviando) return;

    this.replyEnviando = true;
    const texto = this.replyText.trim();

    this.perfilService.addShoutComentario({ shoutId: this._shout.id, parentId: c.id, comentario: texto } as any)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (nuevoId: any) => {
          const parentRoot = c.parentId ?? c.id;
          this.comentarios.push(this.crearLocal(nuevoId, texto, parentRoot));
          this.replyEnviando = false;
          this.cancelarRespuesta();
          this.construirArbol();
        },
        error: () => { this.replyEnviando = false; },
      });
  }

  eliminarComentario(c: any): void {
    if (!this.notificationService.confirm('¿Seguro que deseas eliminar este comentario?')) return;

    this.perfilService.deleteShoutComentario(c.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.comentarios = this.comentarios.filter((x) => x.id !== c.id && x.parentId !== c.id);
      this.construirArbol();
    });
  }

  editar(c: any): void {
    this.editId = c.id;
    this.editText = c.comentario;
    this.replyTo = null;
  }

  cancelarEdicion(): void {
    this.editId = null;
    this.editText = '';
  }

  guardarEdicion(c: any): void {
    if (!this.editText?.trim() || this.editEnviando) return;

    this.editEnviando = true;
    const texto = this.editText.trim();
    this.perfilService.editarShoutComentario(c.id, texto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        c.comentario = texto;
        this.editEnviando = false;
        this.cancelarEdicion();
      },
      error: () => { this.editEnviando = false; },
    });
  }

  fijar(c: any): void {
    this.perfilService.fijarShoutComentario(c.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (fijado: any) => {
        c.fijado = fijado;
        this.notificationService.success(fijado ? 'Comentario fijado' : 'Comentario desfijado', 'Shouts');
        this.construirArbol();
      },
      error: () => {},
    });
  }

  denunciar(c: any): void {
    if (!this.logueado) {
      this.notificationService.warning('Inicia sesión para denunciar', 'Shouts');
      return;
    }
    const motivo = this.pedirMotivoDenuncia();
    if (!motivo) return;

    this.perfilService.denunciarShoutComentario(c.id, motivo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.notificationService.success('Denuncia enviada. Gracias por reportar.', 'Denuncia'),
      error: () => {},
    });
  }

  private pedirMotivoDenuncia(): string | null {
    const msg = 'Motivo de la denuncia:\n' +
      MOTIVOS_DENUNCIA.map((r, i) => `${i + 1}. ${r}`).join('\n') +
      '\n\nEscribe el número de una opción (o tu propio motivo):';
    const input = (window.prompt(msg) || '').trim();
    if (!input) return null;
    const n = parseInt(input, 10);
    if (n >= 1 && n <= MOTIVOS_DENUNCIA.length) return MOTIVOS_DENUNCIA[n - 1];
    return input;
  }

  votar(c: any, valor: number): void {
    if (!this.logueado) {
      this.notificationService.warning('Inicia sesión para votar', 'Shouts');
      return;
    }
    if (c.votando) return;

    c.votando = true;
    this.perfilService.votarShoutComentario(c.id, valor).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        c.votos = res?.total ?? c.votos ?? 0;
        c.miVoto = res?.miVoto ?? 0;
        c.votando = false;
      },
      error: () => { c.votando = false; },
    });
  }

  // ---------------------------------------------------------------- Helpers

  private crearLocal(id: number, comentario: string, parentId: number | null): any {
    return {
      id,
      parentId,
      comentario,
      fechaRegistro: new Date().toISOString(),
      usuario: this.currentUser.usuario.userName,
      avatar: this.currentUser.usuario.avatar,
      votos: 0,
      miVoto: 0,
      votosArriba: 0,
      votosAbajo: 0,
    };
  }

  /** Escapa HTML y convierte URLs y @menciones en enlaces. */
  formatear(texto: string): string {
    if (!texto) return '';
    const escapado = texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escapado
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="nofollow noopener">$1</a>')
      .replace(/(^|\s)@([a-zA-Z0-9_]+)/g, '$1<a href="/perfil/$2">@$2</a>')
      .replace(/\n/g, '<br>');
  }
}
