import { Component, DestroyRef, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { IHttpFotosService } from 'src/app/services/interfaces/httpFotos.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { MensajesBadgeService } from 'src/app/services/shared/mensajes-badge.service';
import { UserAvatarComponent } from '../../../addons/user-avatar/user-avatar.component';
import { UserPopoverDirective } from '../../../../shared/directives/userPopover.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MensajesSidebarComponent } from '../mensajes-sidebar/mensajes-sidebar.component';
import { DatePipe } from '@angular/common';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';

const PAGE_SIZE = 30;
// Distancia (px) al fondo bajo la cual se considera que el usuario "está siguiendo" el chat.
const NEAR_BOTTOM = 80;
// Cada cuánto se avisa "escribiendo…" al otro, y cuánto dura el indicador sin nuevos avisos.
const TYPING_SEND_EVERY_MS = 2500;
const TYPING_SHOW_FOR_MS = 3500;

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
  private fotosService = inject(IHttpFotosService);
  private activatedRoute = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private signalrService = inject(SignalrService);
  private badgeService = inject(MensajesBadgeService);

  private readonly destroyRef = inject(DestroyRef);

  readonly chatBody = viewChild<ElementRef<HTMLElement>>('chatBody');
  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  public mensajes: any[] = [];
  public otro: any;
  public asunto: string = '';
  public hayMas = false;
  public cargandoMas = false;
  public nuevosSinLeer = 0;
  public respuesta: string = '';
  public enviando = false;
  public subiendo = false;
  public bloqueado = false;
  public escribiendo = false;

  private id?: number;
  private userName?: string;
  private lastTypingSent = 0;
  private typingTimer: any;

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
        this.mensajes.forEach((m) => m.esMio && (m.leido = true));
      }
    });

    this.signalrService.escribiendo$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
      if (this.otro && p?.porId === this.otro.id) {
        this.escribiendo = true;
        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => (this.escribiendo = false), TYPING_SHOW_FOR_MS);
      }
    });

    this.destroyRef.onDestroy(() => clearTimeout(this.typingTimer));
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
        this.nuevosSinLeer = 0;
        this.escribiendo = false;
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
        const porId = new Map<number, any>(this.mensajes.map((m) => [m.id, m]));
        let nuevosAjenos = 0;

        for (const m of page?.mensajes ?? []) {
          const existente = porId.get(m.id);

          if (existente) {
            existente.leido = m.leido;
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

        if (nuevosAjenos > 0) {
          this.escribiendo = false;
        }

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

  responderMensaje(): void {
    const texto = this.respuesta.trim();

    if (!texto) {
      return;
    }

    // El contenido es HTML: sin esto Shift+Enter se perdería al renderizar.
    this.enviar(texto.replace(/\r?\n/g, '<br>'), () => (this.respuesta = ''));
  }

  private enviar(contenido: string, alExito?: () => void): void {
    if (!this.otro || this.enviando || this.bloqueado) {
      return;
    }

    this.enviando = true;

    this.mensajesService
      .sendMensajePrivado({ aUserName: this.otro.userName, asunto: '', contenido })
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

  // Avisa "escribiendo…" al otro, como máximo una vez cada TYPING_SEND_EVERY_MS.
  onTyping(): void {
    const ahora = Date.now();

    if (!this.otro || !this.respuesta.trim() || ahora - this.lastTypingSent < TYPING_SEND_EVERY_MS) {
      return;
    }

    this.lastTypingSent = ahora;
    this.signalrService.notifyTyping(this.otro.id);
  }

  // Sube la imagen con el endpoint existente de fotos y la envía como mensaje.
  adjuntarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file || this.subiendo || !this.otro || this.bloqueado) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.notificationService.error('Solo puedes adjuntar imágenes', 'Archivo no válido');
      return;
    }

    this.subiendo = true;

    this.fotosService
      .uploadImage(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (url: string) => {
          this.subiendo = false;

          if (url) {
            this.enviar(`<img src="${url}" alt="Imagen adjunta">`);
          }
        },
        error: () => (this.subiendo = false),
      });
  }

  // Oculta el mensaje solo para mí (el otro lo sigue viendo).
  eliminarMensaje(mensaje: any): void {
    if (!confirm('¿Eliminar este mensaje? Solo se borrará para ti.')) {
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
