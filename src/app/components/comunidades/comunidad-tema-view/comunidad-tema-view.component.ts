import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SEOService } from 'src/app/services/shared/seo.service';

// Umbral de puntaje por debajo del cual un comentario se colapsa (estilo Reddit)
const UMBRAL_COLAPSO = -5;
// Denuncias pendientes a partir de las cuales el comentario se auto-oculta
const UMBRAL_DENUNCIAS = 3;
// Motivos de denuncia predefinidos (el usuario puede elegir número o escribir el suyo)
const MOTIVOS_DENUNCIA = ['Spam o publicidad', 'Contenido ofensivo', 'Acoso', 'Información falsa', 'Contenido sexual', 'Otro'];

@Component({
  standalone: false,
  selector: 'app-comunidad-tema-view',
  templateUrl: './comunidad-tema-view.component.html',
  styleUrls: ['./comunidad-tema-view.component.scss'],
})
export class ComunidadTemaViewComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public tema: any = null;
  public currentUser: any;
  public loading: boolean = true;
  public slug: string = '';

  // Comentario raíz
  public nuevoComentario: string = '';
  public enviando: boolean = false;

  // Orden de los comentarios raíz
  public orden: 'mejores' | 'recientes' | 'controvertido' = 'mejores';

  // Árbol de comentarios (raíz con sus .respuestas)
  public arbol: any[] = [];

  // Estado de respuesta / edición
  public replyTo: number | null = null;
  public replyText: string = '';
  public replyEnviando: boolean = false;

  public editId: number | null = null;
  public editText: string = '';
  public editEnviando: boolean = false;

  constructor(
    private displayService: DisplayComponentService,
    private comunidadesService: IHttpComunidadesService,
    private securityService: IHttpSecurityService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private seoService: SEOService
  ) {
    this.displayService.setDisplay({ mainMenu: true, footer: true, searchFooter: true, submenu: true, background: '' });
  }

  ngOnInit(): void {
    this.currentUser = this.securityService.getCurrentUser();
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.slug = params['slug'];
      const id = +params['id'];
      this.cargar(id);
    });
  }

  cargar(id: number): void {
    this.loading = true;
    this.comunidadesService.getTema(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value: any) => {
        this.tema = value;
        this.tema.comentarios = this.tema.comentarios ?? [];
        this.construirArbol();
        this.loading = false;

        const limpio = (this.tema.contenido || '').replace(/<[^>]*>/g, '').trim();
        this.seoService.setSEO({
          title: this.tema.titulo || this.tema.nombre,
          description: limpio ? limpio.substring(0, 200) : `${this.tema.titulo} - Tema en la comunidad ${this.tema.comunidad?.nombre ?? ''} de Taringa.`,
          type: 'article',
          imageURL: this.tema.imagen || '',
          tags: [this.tema.titulo, this.tema.comunidad?.nombre, 'comunidad', 'taringas'].filter(Boolean),
        });
      },
      error: () => { this.loading = false; this.router.navigate(['/comunidades', this.slug]); },
    });
  }

  // ---------------------------------------------------------------- Árbol

  construirArbol(): void {
    const flat: any[] = this.tema?.comentarios ?? [];
    const roots = flat.filter((c) => !c.parentId);
    const hijosPorPadre = new Map<number, any[]>();

    for (const c of flat) {
      if (c.parentId) {
        const arr = hijosPorPadre.get(c.parentId) ?? [];
        arr.push(c);
        hijosPorPadre.set(c.parentId, arr);
      }
    }

    for (const r of roots) {
      r.respuestas = (hijosPorPadre.get(r.id) ?? [])
        .sort((a, b) => new Date(a.fechaComentario).getTime() - new Date(b.fechaComentario).getTime());
    }

    if (this.orden === 'mejores') {
      roots.sort((a, b) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0)
        || (b.votos || 0) - (a.votos || 0)
        || new Date(b.fechaComentario).getTime() - new Date(a.fechaComentario).getTime());
    } else if (this.orden === 'controvertido') {
      roots.sort((a, b) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0)
        || this.controversia(b) - this.controversia(a)
        || (this.totalVotos(b) - this.totalVotos(a))
        || new Date(b.fechaComentario).getTime() - new Date(a.fechaComentario).getTime());
    } else {
      roots.sort((a, b) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0)
        || new Date(b.fechaComentario).getTime() - new Date(a.fechaComentario).getTime());
    }

    // Destaca el mejor comentario (estilo "comentario destacado")
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

  // "Controvertido" = engagement equilibrado: cuanto mayor es el menor lado, más polémico
  private controversia(c: any): number {
    return Math.min(c.votosArriba || 0, c.votosAbajo || 0);
  }

  private totalVotos(c: any): number {
    return (c.votosArriba || 0) + (c.votosAbajo || 0);
  }

  get totalComentarios(): number {
    return this.tema?.comentarios?.length ?? 0;
  }

  // ---------------------------------------------------------------- Permisos

  get logueado(): boolean {
    return !!this.currentUser?.usuario;
  }

  get esMio(): boolean {
    return this.currentUser?.usuario?.userName === this.tema?.userName;
  }

  get esAdmin(): boolean {
    const rango = this.currentUser?.usuario?.rango;
    return rango === 'Administrador' || rango === 'Moderador';
  }

  get puedeGestionar(): boolean {
    return this.esMio || this.esAdmin;
  }

  puedeModerarComentario(c: any): boolean {
    return this.logueado && (c.userName === this.currentUser?.usuario?.userName || this.esAdmin);
  }

  puedeFijar(): boolean {
    // Mods/admins o el dueño de la comunidad
    return this.esAdmin || this.tema?.comunidad?.usuarioId === this.currentUser?.usuario?.id;
  }

  fijar(c: any): void {
    this.comunidadesService.fijarComentario(c.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (fijado: any) => {
        c.fijado = fijado;
        this.notificationService.success(fijado ? 'Comentario fijado' : 'Comentario desfijado', 'Comentarios');
        this.construirArbol();
      },
      error: () => {},
    });
  }

  estaColapsado(c: any): boolean {
    if (c._mostrar) return false;
    return (c.votos || 0) <= UMBRAL_COLAPSO || (c.denunciasPendientes || 0) >= UMBRAL_DENUNCIAS;
  }

  mostrarColapsado(c: any): void {
    c._mostrar = true;
  }

  // ---------------------------------------------------------------- Tema

  eliminar(): void {
    if (!confirm('¿Eliminar este tema? Esta acción no se puede deshacer.')) return;

    this.comunidadesService.deleteTema(this.tema.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.success('El tema ha sido eliminado', 'Tema eliminado');
        this.router.navigate(['/comunidades', this.slug]);
      },
      error: () => {},
    });
  }

  cambiarSticky(): void {
    this.comunidadesService.changeStickyTema(this.tema.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value: any) => {
        this.tema.sticky = value;
        this.notificationService.success('Se ha cambiado el sticky de este tema correctamente', 'Sticky');
      },
      error: () => {},
    });
  }

  votarTema(valor: number): void {
    if (!this.logueado) {
      this.notificationService.warning('Inicia sesión para votar', 'Comunidades');
      return;
    }
    if (this.tema._votando) return;

    this.tema._votando = true;
    this.comunidadesService.votarTema(this.tema.id, valor).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.tema.votos = res?.total ?? this.tema.votos ?? 0;
        this.tema.miVoto = res?.miVoto ?? 0;
        this.tema._votando = false;
      },
      error: () => { this.tema._votando = false; },
    });
  }

  // ---------------------------------------------------------------- Comentarios

  comentar(): void {
    if (!this.nuevoComentario.trim() || this.enviando) return;

    this.enviando = true;
    const contenido = this.nuevoComentario.trim();
    const model = { comunidadTemaId: this.tema.id, contenido };

    this.comunidadesService.addTemaComentario(model).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (nuevoId: any) => {
        this.tema.comentarios.push(this.crearComentarioLocal(nuevoId, contenido, null));
        this.nuevoComentario = '';
        this.enviando = false;
        this.construirArbol();
      },
      error: () => { this.enviando = false; },
    });
  }

  responder(c: any): void {
    if (!this.logueado) {
      this.notificationService.warning('Inicia sesión para responder', 'Comentarios');
      return;
    }
    this.replyTo = c.id;
    this.replyText = '';
    this.editId = null;
  }

  cancelarRespuesta(): void {
    this.replyTo = null;
    this.replyText = '';
  }

  enviarRespuesta(c: any): void {
    if (!this.replyText.trim() || this.replyEnviando) return;

    this.replyEnviando = true;
    const contenido = this.replyText.trim();
    const model = { comunidadTemaId: this.tema.id, parentId: c.id, contenido };

    this.comunidadesService.addTemaComentario(model).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (nuevoId: any) => {
        // El backend aplana al raíz: el padre real es la raíz de 'c'
        const parentRoot = c.parentId ?? c.id;
        this.tema.comentarios.push(this.crearComentarioLocal(nuevoId, contenido, parentRoot));
        this.replyEnviando = false;
        this.cancelarRespuesta();
        this.construirArbol();
      },
      error: () => { this.replyEnviando = false; },
    });
  }

  editar(c: any): void {
    this.editId = c.id;
    this.editText = c.contenido;
    this.replyTo = null;
  }

  cancelarEdicion(): void {
    this.editId = null;
    this.editText = '';
  }

  guardarEdicion(c: any): void {
    if (!this.editText.trim() || this.editEnviando) return;

    this.editEnviando = true;
    const contenido = this.editText.trim();

    this.comunidadesService.editarComentario(c.id, contenido).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        c.contenido = contenido;
        c.fechaActualiza = new Date().toISOString();
        this.editEnviando = false;
        this.cancelarEdicion();
      },
      error: () => { this.editEnviando = false; },
    });
  }

  eliminarComentario(c: any): void {
    if (!confirm('¿Eliminar este comentario?')) return;

    this.comunidadesService.eliminarComentario(c.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        // Quita el comentario y sus respuestas del listado local
        this.tema.comentarios = this.tema.comentarios.filter(
          (x: any) => x.id !== c.id && x.parentId !== c.id
        );
        this.construirArbol();
      },
      error: () => {},
    });
  }

  esComentarioPropio(c: any): boolean {
    return c.userName === this.currentUser?.usuario?.userName;
  }

  denunciar(c: any): void {
    if (!this.logueado) {
      this.notificationService.warning('Inicia sesión para denunciar', 'Comentarios');
      return;
    }
    const motivo = this.pedirMotivoDenuncia();
    if (!motivo) return;

    this.comunidadesService.denunciarComentario(c.id, motivo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.notificationService.success('Denuncia enviada. Gracias por reportar.', 'Denuncia'),
      error: () => {},
    });
  }

  votar(c: any, valor: number): void {
    if (!this.logueado) {
      this.notificationService.warning('Inicia sesión para votar', 'Comentarios');
      return;
    }
    if (c.votando) return;

    c.votando = true;
    this.comunidadesService.votarComentario(c.id, valor).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        c.votos = res?.total ?? c.votos ?? 0;
        c.miVoto = res?.miVoto ?? 0;
        c.votando = false;
      },
      error: () => { c.votando = false; },
    });
  }

  // ---------------------------------------------------------------- Helpers

  private crearComentarioLocal(id: number, contenido: string, parentId: number | null): any {
    return {
      id,
      parentId,
      contenido,
      fechaComentario: new Date().toISOString(),
      userName: this.currentUser.usuario.userName,
      avatar: this.currentUser.usuario.avatar,
      rango: this.currentUser.usuario.rango ? { nombre: this.currentUser.usuario.rango } : null,
      votos: 0,
      miVoto: 0,
    };
  }

  /** Pide un motivo de denuncia mostrando opciones predefinidas; permite número o texto libre. */
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
