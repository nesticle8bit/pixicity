import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-mensajes-conversacion',
  templateUrl: './mensajes-conversacion.component.html',
  styleUrls: ['./mensajes-conversacion.component.scss'],
})
export class MensajesConversacionComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('chatBody') chatBody?: ElementRef<HTMLElement>;

  public mensajes: any[] = [];
  public otro: any;
  public asunto: string = '';
  public id: number = 0;
  public respuesta: string = '';
  public enviando = false;

  constructor(
    private displayService: DisplayComponentService,
    private mensajesService: IHttpMensajesService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      this.id = value.get('id');
    });

    this.getConversacion();
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

  getConversacion(): void {
    this.mensajesService
      .getConversacion(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: any[]) => {
        this.mensajes = value ?? [];

        const ajeno = this.mensajes.find((m) => !m.esMio);
        const propio = this.mensajes.find((m) => m.esMio);
        this.otro = ajeno ? ajeno.usuarioDe : propio?.usuarioA;

        const ultimo = this.mensajes[this.mensajes.length - 1];
        this.asunto = ultimo?.asunto ?? '';

        setTimeout(() => this.scrollToBottom());
      });
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
    const contenido = this.respuesta.trim();

    if (!contenido || !this.otro || this.enviando) {
      return;
    }

    const mp = {
      aUserName: this.otro.userName,
      asunto: this.asunto.startsWith('RE: ') ? this.asunto : `RE: ${this.asunto}`,
      contenido,
    };

    this.enviando = true;

    this.mensajesService
      .sendMensajePrivado(mp)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.enviando = false;

          if (response?.type === 'id') {
            this.respuesta = '';
            this.getConversacion();
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

  private scrollToBottom(): void {
    const el = this.chatBody?.nativeElement;

    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
