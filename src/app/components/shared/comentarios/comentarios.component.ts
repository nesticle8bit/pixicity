import { Component, DestroyRef, inject, Input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ComentarioHilo, ComentariosAcciones, OrdenComentarios } from 'src/app/models/shared/comentario-hilo.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { FormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { NgTemplateOutlet, NgStyle } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { enNavegador } from '../../../shared/helpers/plataforma';

/** Comentario con el estado que solo existe en pantalla. */
interface ComentarioVista extends ComentarioHilo {
  respuestas?: ComentarioVista[];
  destacado?: boolean;
  mostrarOculto?: boolean;
  votando?: boolean;
}

// Puntaje por debajo del cual un comentario se colapsa (estilo Reddit).
const UMBRAL_COLAPSO = -5;
// Denuncias pendientes a partir de las cuales el comentario se oculta.
const UMBRAL_DENUNCIAS = 3;
// Votos mínimos para marcar el mejor comentario como destacado.
const VOTOS_DESTACADO = 3;
const MOTIVOS_DENUNCIA = ['Spam o publicidad', 'Contenido ofensivo', 'Acoso', 'Información falsa', 'Contenido sexual', 'Otro'];

/**
 * Sección de comentarios común a temas de comunidades, posts y fotos: lista con respuestas (un nivel), orden,
 * votos, comentario destacado, colapso por puntaje o denuncias, fijar, denunciar, editar y borrar.
 * Cada página le pasa los comentarios ya convertidos a ComentarioHilo y las llamadas a su API en `acciones`.
 */
@Component({
    selector: 'app-comentarios',
    templateUrl: './comentarios.component.html',
    styleUrls: ['./comentarios.component.scss'],
    imports: [
        UserAvatarComponent,
        FormsModule,
        MatTooltip,
        NgTemplateOutlet,
        RouterLink,
        UserPopoverDirective,
        NgStyle,
        TimeAgoPipe,
    ],
})
export class ComentariosComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly securityService = inject(IHttpSecurityService);
  private readonly notificationService = inject(NotificationService);
  private readonly bottomSheet = inject(MatBottomSheet);

  private lista: ComentarioVista[] = [];

  @Input() set comentarios(value: ComentarioHilo[] | null | undefined) {
    this.lista = (value ?? []).map((c) => ({ ...c }));
    this.construirArbol();
    this.irAlComentarioDelHash();
  }

  /** Comentario resaltado unos segundos al llegar con #comentario-{id} (p. ej. desde una notificación). */
  public resaltadoId: number | null = null;
  private hashAtendido: string | null = null;
  private timerResaltado?: ReturnType<typeof setTimeout>;

  constructor() {
    // Mismo documento con otro hash (la notificación apunta a la página abierta): el navegador no recarga.
    const alCambiarHash = () => this.irAlComentarioDelHash();
    if (enNavegador()) window.addEventListener('hashchange', alCambiarHash);
    this.destroyRef.onDestroy(() => {
      if (enNavegador()) window.removeEventListener('hashchange', alCambiarHash);
      clearTimeout(this.timerResaltado);
    });
  }

  private irAlComentarioDelHash(): void {
    if (!enNavegador()) return;
    const hash = window.location.hash;
    const id = Number(/^#comentario-(\d+)$/.exec(hash)?.[1]);
    if (!id || hash === this.hashAtendido) return;

    const comentario = this.lista.find((c) => c.id === id);
    if (!comentario) return; // Aún no cargó (o se borró): se reintenta cuando lleguen los comentarios.
    this.hashAtendido = hash;
    comentario.mostrarOculto = true; // Si estaba colapsado por puntaje o denuncias, se muestra.

    // Esperar a que se pinte antes de desplazar.
    setTimeout(() => {
      document.getElementById(`comentario-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.resaltadoId = id;
      clearTimeout(this.timerResaltado);
      this.timerResaltado = setTimeout(() => (this.resaltadoId = null), 4000);
    }, 150);
  }

  @Input({ required: true }) acciones!: ComentariosAcciones;
  /** Dueño del contenido o staff: puede fijar comentarios raíz. */
  @Input() puedeFijar = false;
  /** El dueño del contenido puede borrar comentarios ajenos (además del autor y del staff). */
  @Input() puedeBorrarTodos = false;
  /** Si mods y admins pueden editar comentarios ajenos (en posts solo el autor puede). */
  @Input() staffPuedeEditar = true;
  /** Autor del contenido: sus comentarios llevan la marca "OP". */
  @Input() autorContenido: string | null = null;
  /** Comentarios cerrados por el autor: se ven pero no se puede comentar. */
  @Input() cerrados = false;

  /** Se pidió ver las versiones anteriores de un comentario (solo si trae historial). */
  readonly verHistorial = output<ComentarioHilo>();
  /** Cambió la cantidad de comentarios (alta o baja). */
  readonly totalCambio = output<number>();

  public arbol: ComentarioVista[] = [];
  public orden: OrdenComentarios = 'mejores';

  public nuevoComentario = '';
  public enviando = false;

  public replyTo: number | null = null;
  public replyText = '';
  public replyEnviando = false;

  public editId: number | null = null;
  public editText = '';
  public editEnviando = false;

  // - Sesión y permisos

  private get miUsuario(): string | undefined {
    return this.securityService.getCurrentUser()?.usuario?.userName;
  }

  get logueado(): boolean {
    return !!this.securityService.getCurrentUser()?.usuario;
  }

  get miAvatar(): string | null {
    return this.securityService.getCurrentUser()?.usuario?.avatar ?? null;
  }

  private get esStaff(): boolean {
    const rango = this.securityService.getCurrentUser()?.usuario?.rango;
    return rango === 'Administrador' || rango === 'Moderador';
  }

  esPropio(c: ComentarioHilo): boolean {
    return !!this.miUsuario && c.userName === this.miUsuario;
  }

  esOP(c: ComentarioHilo): boolean {
    return !!this.autorContenido && c.userName === this.autorContenido;
  }

  puedeEditar(c: ComentarioHilo): boolean {
    return this.logueado && (this.esPropio(c) || (this.esStaff && this.staffPuedeEditar));
  }

  puedeBorrar(c: ComentarioHilo): boolean {
    return this.logueado && (this.esPropio(c) || this.esStaff || this.puedeBorrarTodos);
  }

  puedeDenunciar(c: ComentarioHilo): boolean {
    return this.logueado && !this.esPropio(c);
  }

  puedeFijarComentario(c: ComentarioHilo): boolean {
    return this.puedeFijar && !c.parentId;
  }

  // - Árbol y orden

  get total(): number {
    return this.lista.length;
  }

  private construirArbol(): void {
    const raices = this.lista.filter((c) => !c.parentId);
    const hijos = new Map<number, ComentarioVista[]>();

    for (const c of this.lista) {
      if (c.parentId) {
        const arr = hijos.get(c.parentId) ?? [];
        arr.push(c);
        hijos.set(c.parentId, arr);
      }
    }

    const porFecha = (a: ComentarioVista, b: ComentarioVista) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    for (const r of raices) {
      r.respuestas = (hijos.get(r.id) ?? []).sort(porFecha);
    }

    const fijadosPrimero = (a: ComentarioVista, b: ComentarioVista) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0);
    const masNuevos = (a: ComentarioVista, b: ComentarioVista) => -porFecha(a, b);

    if (this.orden === 'mejores') {
      raices.sort((a, b) => fijadosPrimero(a, b) || (b.votos || 0) - (a.votos || 0) || masNuevos(a, b));
    } else if (this.orden === 'controvertido') {
      raices.sort((a, b) => fijadosPrimero(a, b)
        || this.controversia(b) - this.controversia(a)
        || this.totalVotos(b) - this.totalVotos(a)
        || masNuevos(a, b));
    } else {
      raices.sort((a, b) => fijadosPrimero(a, b) || masNuevos(a, b));
    }

    raices.forEach((r) => (r.destacado = false));
    const mejor = raices.reduce<ComentarioVista | null>((m, r) => ((r.votos || 0) > (m?.votos || 0) ? r : m), null);
    if (mejor && (mejor.votos || 0) >= VOTOS_DESTACADO) {
      mejor.destacado = true;
    }

    this.arbol = raices;
  }

  cambiarOrden(orden: OrdenComentarios): void {
    if (this.orden === orden) return;
    this.orden = orden;
    this.construirArbol();
  }

  // "Controvertido" = votos equilibrados: cuanto mayor el lado menor, más polémico.
  private controversia(c: ComentarioHilo): number {
    return Math.min(c.votosArriba || 0, c.votosAbajo || 0);
  }

  private totalVotos(c: ComentarioHilo): number {
    return (c.votosArriba || 0) + (c.votosAbajo || 0);
  }

  estaColapsado(c: ComentarioVista): boolean {
    if (c.mostrarOculto) return false;
    return (c.votos || 0) <= UMBRAL_COLAPSO || this.ocultoPorDenuncias(c);
  }

  ocultoPorDenuncias(c: ComentarioHilo): boolean {
    return (c.denunciasPendientes || 0) >= UMBRAL_DENUNCIAS;
  }

  mostrarColapsado(c: ComentarioVista): void {
    c.mostrarOculto = true;
  }

  // - Publicar

  comentar(): void {
    const contenido = this.nuevoComentario.trim();
    if (!contenido || this.enviando) return;

    this.enviando = true;
    this.acciones.comentar(contenido, null).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (id) => {
        this.agregarLocal(id, contenido, null);
        this.nuevoComentario = '';
        this.enviando = false;
      },
      error: () => (this.enviando = false),
    });
  }

  responder(c: ComentarioVista): void {
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

  enviarRespuesta(c: ComentarioVista): void {
    const contenido = this.replyText.trim();
    if (!contenido || this.replyEnviando) return;

    // Las respuestas cuelgan siempre del comentario raíz.
    const raiz = c.parentId ?? c.id;
    this.replyEnviando = true;
    this.acciones.comentar(contenido, raiz).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (id) => {
        this.agregarLocal(id, contenido, raiz);
        this.replyEnviando = false;
        this.cancelarRespuesta();
      },
      error: () => (this.replyEnviando = false),
    });
  }

  private agregarLocal(id: number, contenido: string, parentId: number | null): void {
    const usuario = this.securityService.getCurrentUser()?.usuario;
    this.lista.push({
      id,
      parentId,
      contenido,
      fecha: new Date().toISOString(),
      fechaEdicion: null,
      userName: usuario?.userName ?? '',
      avatar: usuario?.avatar ?? null,
      rango: usuario?.rango ? { nombre: usuario.rango, color: null, icono: null } : null,
      votos: 0,
      miVoto: 0,
      votosArriba: 0,
      votosAbajo: 0,
      fijado: false,
      denunciasPendientes: 0,
    });
    this.construirArbol();
    this.totalCambio.emit(this.total);
  }

  // - Editar / borrar

  editar(c: ComentarioVista): void {
    this.editId = c.id;
    this.editText = c.contenido;
    this.replyTo = null;
  }

  cancelarEdicion(): void {
    this.editId = null;
    this.editText = '';
  }

  guardarEdicion(c: ComentarioVista): void {
    const contenido = this.editText.trim();
    if (!contenido || this.editEnviando) return;

    this.editEnviando = true;
    this.acciones.editar(c.id, contenido).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const ahora = new Date().toISOString();
        c.historial?.unshift({ fecha: ahora, contenido: c.contenido });
        c.contenido = contenido;
        c.fechaEdicion = ahora;
        this.editEnviando = false;
        this.cancelarEdicion();
      },
      error: () => (this.editEnviando = false),
    });
  }

  eliminar(c: ComentarioVista): void {
    if (!this.notificationService.confirm('¿Eliminar este comentario?')) return;

    this.acciones.eliminar(c.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      // El API borra también sus respuestas.
      this.lista = this.lista.filter((x) => x.id !== c.id && x.parentId !== c.id);
      this.construirArbol();
      this.totalCambio.emit(this.total);
    });
  }

  // - Votar / fijar / denunciar

  votar(c: ComentarioVista, valor: 1 | -1): void {
    if (!this.logueado) {
      this.notificationService.warning('Inicia sesión para votar', 'Comentarios');
      return;
    }
    if (c.votando) return;

    c.votando = true;
    const anterior = c.miVoto || 0;
    this.acciones.votar(c.id, valor).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        c.votos = res?.total ?? c.votos ?? 0;
        c.miVoto = res?.miVoto ?? 0;
        // Mantiene al día los contadores del orden "Controvertido".
        if (anterior === 1) c.votosArriba = Math.max(0, c.votosArriba - 1);
        if (anterior === -1) c.votosAbajo = Math.max(0, c.votosAbajo - 1);
        if (c.miVoto === 1) c.votosArriba++;
        if (c.miVoto === -1) c.votosAbajo++;
        c.votando = false;
      },
      error: () => (c.votando = false),
    });
  }

  fijar(c: ComentarioVista): void {
    this.acciones.fijar(c.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((fijado) => {
      c.fijado = fijado;
      this.notificationService.success(fijado ? 'Comentario fijado' : 'Comentario desfijado', 'Comentarios');
      this.construirArbol();
    });
  }

  denunciar(c: ComentarioVista): void {
    const motivo = this.pedirMotivoDenuncia();
    if (!motivo) return;

    this.acciones.denunciar(c.id, motivo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() =>
      this.notificationService.success('Denuncia enviada. Gracias por reportar.', 'Denuncia')
    );
  }

  /** Pide un motivo de denuncia mostrando opciones predefinidas; acepta el número de una opción o texto libre. */
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

  // - Emojis

  async abrirEmojis(): Promise<void> {
    // emoji-mart pesa cientos de KB: se descarga recién al abrirlo.
    const { BottomSheetsEmojisComponent } = await import(
      'src/app/components/bottom-sheets/bottom-sheets-emojis/bottom-sheets-emojis.component'
    );

    this.bottomSheet
      .open(BottomSheetsEmojisComponent, { closeOnNavigation: true })
      .afterDismissed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor?: { emoji?: { native?: string } }) => {
        if (valor?.emoji?.native) {
          this.nuevoComentario += valor.emoji.native;
        }
      });
  }

  // - Formato

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
