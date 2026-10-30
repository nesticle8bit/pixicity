import { Component, DestroyRef, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { MensajesBadgeService } from 'src/app/services/shared/mensajes-badge.service';
import { UserAvatarComponent } from '../../../addons/user-avatar/user-avatar.component';
import { UserPopoverDirective } from '../../../../shared/directives/userPopover.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MensajesSidebarComponent } from '../mensajes-sidebar/mensajes-sidebar.component';
import { MensajeViewModel } from 'src/app/models/mensajes/mensaje-vm.model';
import { UsuarioAvatarViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { DatePipe } from '@angular/common';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';
import { MatDialog } from '@angular/material/dialog';
import { reemplazarEmotes } from 'src/app/shared/helpers/emotes';
import { imagenesEnTexto, soloUrlsDeImagen } from 'src/app/shared/helpers/imagenes-en-texto';
import { EmojisPopoverService } from '../../../bottom-sheets/bottom-sheets-emojis/emojis-popover.service';

const PAGE_SIZE = 30;
/** Imágenes por mensaje (igual que el API). */
export const MAX_ADJUNTOS = 4;

/** Imagen elegida para el próximo mensaje: se sube al elegirla y se envía con el texto. */
interface Adjunto {
  id: number;
  vista: string;
  url?: string;
  subiendo: boolean;
}
// Distancia (px) al fondo bajo la cual se considera que el usuario "está siguiendo" el chat.
const NEAR_BOTTOM = 80;

const MOTIVOS_DENUNCIA_MP = ['Spam o publicidad', 'Acoso o amenazas', 'Contenido ofensivo', 'Estafa o phishing', 'Contenido sexual', 'Otro'];

@Component({
    selector: 'app-mensajes-conversacion',
    templateUrl: './mensajes-conversacion.component.html',
    styleUrls: ['./mensajes-conversacion.component.scss'],
    imports: [
        RouterLink,
        UserAvatarComponent,
        UserPopoverDirective,
        MatTooltip,
        FormsModule,
        MensajesSidebarComponent,
        DatePipe,
        TruncatePipe,
    ],
})
export class MensajesConversacionComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private mensajesService = inject(IHttpMensajesService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private signalrService = inject(SignalrService);
  private badgeService = inject(MensajesBadgeService);

  /** Los :codigo: de los emotes de Taringa! se muestran como GIF. */
  readonly conEmotes = reemplazarEmotes;
  private dialog = inject(MatDialog);

  private readonly destroyRef = inject(DestroyRef);

  readonly chatBody = viewChild<ElementRef<HTMLElement>>('chatBody');
  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  readonly campoMensaje = viewChild<ElementRef<HTMLTextAreaElement>>('campoMensaje');
  private readonly emojis = inject(EmojisPopoverService);
  emojisAbierto = false;

  public mensajes: MensajeViewModel[] = [];
  public otro?: UsuarioAvatarViewModel;
  public asunto: string = '';
  public hayMas = false;
  public cargandoMas = false;
  public nuevosSinLeer = 0;
  public respuesta: string = '';
  public enviando = false;
  public subiendo = false;
  public bloqueado = false;
  public silenciada = false;
  public adjuntos: Adjunto[] = [];
  private siguienteAdjunto = 1;

  private id?: number;
  private userName?: string;

  constructor() {
    // La ruta es /conversacion/:id (mensaje base) o /chat/:userName (chat nuevo / sin historial).
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.id = value.get('id') ? Number(value.get('id')) : undefined;
      this.userName = value.get('userName') ?? undefined;
      this.cargarInicial();
    });

    this.signalrService.mensaje$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
      if (this.otro && p?.otroId === this.otro.id) {
        this.mergeLatest(!!p.esMio);
      }
    });

    this.signalrService.mensajesLeidos$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
      if (this.otro && p?.porId === this.otro.id) {
        const fecha = p.fecha ?? new Date().toISOString();
        this.mensajes.forEach((m) => {
          if (m.esMio && !m.leido) {
            m.leido = true;
            m.fechaLeido = fecha;
          }
        });
      }
    });

    this.destroyRef.onDestroy(() => {
      this.adjuntos.forEach((a) => URL.revokeObjectURL(a.vista));
    });
  }

  ngOnInit(): void {
    this.displaySections();
  }

  displaySections(): void {
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });
  }

  private cargarInicial(): void {
    this.mensajesService
      .getConversacion({ id: this.id, userName: this.userName, take: PAGE_SIZE })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((page) => {
        this.mensajes = page?.mensajes ?? [];
        this.otro = page?.otro;
        this.hayMas = !!page?.hayMas;
        this.bloqueado = !!page?.bloqueado;
        this.silenciada = !!page?.silenciada;
        this.nuevosSinLeer = 0;
        this.actualizarAsunto();

        // La carga inicial marca como leídos los recibidos: el contador del menú debe bajar.
        this.badgeService.refresh();

        setTimeout(() => this.scrollToBottom());
      });
  }

  // Carga la página anterior y conserva la posición de lectura (no salta al tope).
  cargarAnteriores(): void {
    if (!this.hayMas || this.cargandoMas || this.mensajes.length < 1) {
      return;
    }

    const el = this.chatBody()?.nativeElement;
    const alturaPrevia = el?.scrollHeight ?? 0;
    const topPrevio = el?.scrollTop ?? 0;
    this.cargandoMas = true;

    this.mensajesService
      .getConversacion({ userName: this.otro?.userName, antesDeId: this.mensajes[0].id, take: PAGE_SIZE })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.mensajes = [...(page?.mensajes ?? []), ...this.mensajes];
          this.hayMas = !!page?.hayMas;
          this.cargandoMas = false;

          setTimeout(() => {
            if (el) {
              el.scrollTop = el.scrollHeight - alturaPrevia + topPrevio;
            }
          });
        },
        error: () => (this.cargandoMas = false),
      });
  }

  // Trae lo último y lo fusiona por id. Solo hace auto-scroll si el usuario estaba al fondo (o envió él).
  private mergeLatest(forzarScroll: boolean): void {
    if (!this.otro) {
      return;
    }

    const seguia = this.estaAbajo();

    this.mensajesService
      .getConversacion({ userName: this.otro.userName, take: PAGE_SIZE })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((page) => {
        const porId = new Map<number, MensajeViewModel>(this.mensajes.map((m) => [m.id, m]));
        let nuevosAjenos = 0;

        for (const m of page?.mensajes ?? []) {
          const existente = porId.get(m.id);

          if (existente) {
            existente.leido = m.leido;
            existente.fechaLeido = m.fechaLeido;
          } else {
            porId.set(m.id, m);
            if (!m.esMio) {
              nuevosAjenos++;
            }
          }
        }

        this.mensajes = [...porId.values()].sort((a, b) => a.id - b.id);
        this.bloqueado = !!page?.bloqueado;
        this.actualizarAsunto();

        this.badgeService.refresh();

        if (forzarScroll || seguia) {
          this.nuevosSinLeer = 0;
          setTimeout(() => this.scrollToBottom());
        } else {
          this.nuevosSinLeer += nuevosAjenos;
        }
      });
  }

  onScroll(): void {
    const el = this.chatBody()?.nativeElement;

    if (!el) {
      return;
    }

    if (this.estaAbajo()) {
      this.nuevosSinLeer = 0;
    }

    if (el.scrollTop < 40) {
      this.cargarAnteriores();
    }
  }

  irAlFinal(): void {
    this.nuevosSinLeer = 0;
    this.scrollToBottom();
  }

  esNuevoDia(index: number): boolean {
    if (index === 0) {
      return true;
    }

    const actual = new Date(this.mensajes[index].fechaRegistro).toDateString();
    const previo = new Date(this.mensajes[index - 1].fechaRegistro).toDateString();

    return actual !== previo;
  }

  get subiendoAdjuntos(): boolean {
    return this.adjuntos.some((a) => a.subiendo);
  }

  get puedeEnviar(): boolean {
    const hayAlgo = !!this.respuesta.trim() || this.adjuntos.some((a) => a.url);
    return !!this.otro && !this.bloqueado && !this.enviando && !this.subiendoAdjuntos && hayAlgo;
  }

  responderMensaje(): void {
    if (!this.puedeEnviar) {
      return;
    }

    const texto = this.respuesta.trim();
    const imagenes = this.adjuntos.filter((a) => a.url).map((a) => a.url!);

    // El contenido es HTML: sin esto Shift+Enter se perdería al renderizar.
    this.enviar(texto.replace(/\r?\n/g, '<br>'), imagenes, () => {
      this.respuesta = '';
      this.quitarAdjuntos();
      setTimeout(() => this.ajustarAlto());
    });
  }

  /** El campo crece con el texto hasta un tope (después scrollea) y vuelve a una línea al enviar. */
  ajustarAlto(): void {
    const campo = this.campoMensaje()?.nativeElement;
    if (!campo) return;
    campo.style.height = 'auto';
    campo.style.height = `${Math.min(campo.scrollHeight, 160)}px`;
  }

  async abrirEmojis(boton: HTMLElement): Promise<void> {
    await this.emojis.alternar(boton, {
      alElegir: (emoji) => this.insertarEmoji(emoji),
      noTapar: this.campoMensaje()?.nativeElement,
      emotes: true,
      alCerrar: (porTeclado) => {
        this.emojisAbierto = false;
        if (porTeclado) this.campoMensaje()?.nativeElement.focus();
      },
    });
    this.emojisAbierto = this.emojis.estaAbiertoPara(boton);
  }

  /** Inserta en el cursor (o reemplaza la selección) y deja el cursor justo después. */
  private insertarEmoji(emoji: string): void {
    const campo = this.campoMensaje()?.nativeElement;
    const inicio = campo?.selectionStart ?? this.respuesta.length;
    const fin = campo?.selectionEnd ?? this.respuesta.length;
    this.respuesta = this.respuesta.slice(0, inicio) + emoji + this.respuesta.slice(fin);
    if (campo) {
      // Se escribe ya en el DOM para poder mover el cursor; ngModel después pone el mismo valor y no lo mueve.
      campo.value = this.respuesta;
      const cursor = inicio + emoji.length;
      campo.setSelectionRange(cursor, cursor);
      this.ajustarAlto();
    }
  }

  private enviar(contenido: string, imagenes: string[], alExito?: () => void): void {
    if (!this.otro || this.enviando || this.bloqueado) {
      return;
    }

    this.enviando = true;

    this.mensajesService
      .sendMensajePrivado({ aUserName: this.otro.userName, asunto: '', contenido, imagenes })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.enviando = false;

          if (response?.type === 'id') {
            alExito?.();
            this.mergeLatest(true);
          } else if (response?.message) {
            this.notificationService.error(response.message, 'Error');
          }
        },
        error: () => (this.enviando = false),
      });
  }

  onEnter(event: Event): void {
    const e = event as KeyboardEvent;

    if (!e.shiftKey) {
      e.preventDefault();
      this.responderMensaje();
    }
  }

  /** Elegir imágenes: se suben enseguida y quedan como vista previa hasta enviar (con o sin texto). */
  adjuntarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = [...(input.files ?? [])];
    input.value = '';
    this.agregarAdjuntos(files);
  }

  /** Pegar una captura (Ctrl+V) la adjunta. */
  alPegar(event: ClipboardEvent): void {
    const files = [...(event.clipboardData?.files ?? [])].filter((f) => f.type.startsWith('image/'));
    if (files.length) {
      event.preventDefault();
      this.agregarAdjuntos(files);
    }
  }

  private agregarAdjuntos(files: File[]): void {
    if (!files.length || !this.otro || this.bloqueado) {
      return;
    }

    if (files.some((f) => !f.type.startsWith('image/'))) {
      this.notificationService.error('Solo puedes adjuntar imágenes', 'Archivo no válido');
    }

    const libres = MAX_ADJUNTOS - this.adjuntos.length;
    const imagenes = files.filter((f) => f.type.startsWith('image/'));
    if (imagenes.length > libres) {
      this.notificationService.info(`Puedes adjuntar hasta ${MAX_ADJUNTOS} imágenes por mensaje`, 'Imágenes');
    }

    for (const file of imagenes.slice(0, Math.max(libres, 0))) {
      const adjunto: Adjunto = { id: this.siguienteAdjunto++, vista: URL.createObjectURL(file), subiendo: true };
      this.adjuntos = [...this.adjuntos, adjunto];
      this.subiendo = true;

      this.mensajesService
        .subirImagenMensaje(file)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (url: string) => {
            adjunto.url = url;
            adjunto.subiendo = false;
            this.subiendo = this.subiendoAdjuntos;
          },
          error: () => {
            this.quitarAdjunto(adjunto);
            this.subiendo = this.subiendoAdjuntos;
          },
        });
    }
  }

  quitarAdjunto(adjunto: Adjunto): void {
    URL.revokeObjectURL(adjunto.vista);
    this.adjuntos = this.adjuntos.filter((a) => a.id !== adjunto.id);
  }

  private quitarAdjuntos(): void {
    this.adjuntos.forEach((a) => URL.revokeObjectURL(a.vista));
    this.adjuntos = [];
  }

  /** Imágenes adjuntas de un mensaje (el API las manda una por línea). */
  imagenesDe(m: { imagenes?: string | null }): string[] {
    return (m.imagenes ?? '').split('\n').map((i) => i.trim()).filter(Boolean);
  }

  /** Imágenes externas que no cargaron (la URL terminaba en .png pero no era una imagen): se ocultan. */
  readonly fallidas = new Set<string>();
  private readonly cacheFotos = new WeakMap<object, { fotos: string[]; soloUrls: boolean }>();

  /** Adjuntas + URLs de imagen escritas en el texto, en ese orden y sin repetir. Se calcula una vez por mensaje. */
  private fotosYTexto(m: MensajeViewModel): { fotos: string[]; soloUrls: boolean } {
    let r = this.cacheFotos.get(m);
    if (!r) {
      const enTexto = imagenesEnTexto(m.contenido);
      r = { fotos: [...new Set([...this.imagenesDe(m), ...enTexto])], soloUrls: soloUrlsDeImagen(m.contenido, enTexto) };
      this.cacheFotos.set(m, r);
    }
    return r;
  }

  fotosDe(m: MensajeViewModel): string[] {
    return this.fotosYTexto(m).fotos.filter((f) => !this.fallidas.has(f));
  }

  /** El texto es solo la URL de la imagen: basta con mostrar la imagen (salvo que no haya cargado). */
  ocultarTexto(m: MensajeViewModel): boolean {
    const r = this.fotosYTexto(m);
    return r.soloUrls && r.fotos.every((f) => !this.fallidas.has(f));
  }

  /** El último mensaje mío que el otro ya vio: debajo va "Visto hace…". */
  get idUltimoVisto(): number | null {
    for (let i = this.mensajes.length - 1; i >= 0; i--) {
      const m = this.mensajes[i];
      if (!m.esMio) return null; // me respondió después: no hace falta el "Visto"
      if (m.leido) return m.id;
    }
    return null;
  }

  alternarSilencio(): void {
    if (!this.otro) return;
    const silenciar = !this.silenciada;
    this.mensajesService
      .silenciarConversacion(this.otro.id, silenciar)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ok) => {
        if (!ok) return;
        this.silenciada = silenciar;
        this.badgeService.refresh();
        this.notificationService.success(
          silenciar ? 'No te avisaremos de sus mensajes nuevos' : 'Vuelves a recibir avisos',
          silenciar ? 'Conversación silenciada' : 'Avisos activados',
        );
      });
  }

  archivar(): void {
    if (!this.otro) return;
    this.mensajesService
      .archivarConversaciones([this.otro.id], true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ok) => {
        if (!ok) return;
        this.notificationService.success('Vuelve a la bandeja si te escriben de nuevo.', 'Conversación archivada');
        this.router.navigate(['/mensajes']);
      });
  }

  // Oculta el mensaje solo para mí (el otro lo sigue viendo).
  async eliminarMensaje(mensaje: MensajeViewModel): Promise<void> {
    if (!(await this.notificationService.confirm('¿Eliminar este mensaje? Solo se borrará para ti.'))) {
      return;
    }

    this.mensajesService
      .deleteMensajesById([mensaje.id])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.mensajes = this.mensajes.filter((m) => m.id !== mensaje.id);
          this.actualizarAsunto();
        }
      });
  }

  // Solo los recibidos: el staff verá el contenido en la cola de reportes.
  async denunciarMensaje(mensaje: MensajeViewModel): Promise<void> {
    const { DialogMotivoDenunciaComponent } = await import('../../../dialogs/dialog-motivo-denuncia/dialog-motivo-denuncia.component');
    this.dialog
      .open(DialogMotivoDenunciaComponent, { width: '440px', maxWidth: '95vw', data: { que: 'mensaje', motivos: MOTIVOS_DENUNCIA_MP } })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((motivo?: string) => {
        if (!motivo) return;
        this.mensajesService.denunciarMensaje(mensaje.id, motivo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok) => {
          if (ok) this.notificationService.success('Denuncia enviada. El equipo de moderación la revisará.', 'Denuncia');
        });
      });
  }

  // El asunto es opcional en el chat: se muestra el último que haya, si lo hay.
  private actualizarAsunto(): void {
    this.asunto = [...this.mensajes].reverse().find((m) => !!m.asunto)?.asunto ?? '';
  }

  private estaAbajo(): boolean {
    const el = this.chatBody()?.nativeElement;

    return !el || el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM;
  }

  private scrollToBottom(): void {
    const el = this.chatBody()?.nativeElement;

    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
