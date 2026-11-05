import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { MensajesBadgeService } from 'src/app/services/shared/mensajes-badge.service';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogEnviarMPComponent } from 'src/app/components/dialogs/dialog-enviar-mp/dialog-enviar-mp.component';
import { MensajesListaService } from './mensajes-lista.service';
import { ConversacionFila } from 'src/app/models/mensajes/mensaje-vm.model';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-mensajes',
    templateUrl: './mensajes.component.html',
    styleUrls: ['./mensajes.component.scss'],
    imports: [
        MatCheckbox,
        MatTooltip,
        FormsModule,
        UserAvatarComponent,
        RouterLink,
        RouterOutlet,
        MatPaginator,
        DatePipe,
        TimeAgoPipe,
    ],
})
export class MensajesComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private mensajesService = inject(IHttpMensajesService);
  paginationService = inject(PaginationService);
  private formBuilder = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private signalrService = inject(SignalrService);
  private router = inject(Router);
  private badgeService = inject(MensajesBadgeService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public conversaciones: ConversacionFila[] = [];
  public totalCount: number = 0;
  /** Carpeta visible: bandeja de entrada o archivadas. */
  public archivadas = false;
  public totalArchivadas = 0;
  /** Usuario del chat abierto a la derecha (se resalta en la lista); null = ninguno. */
  public activo: string | null = null;
  /** Hay un chat en la ruta hija: en celular se ve el chat y no la lista. */
  public chatAbierto = false;
  /** Checkboxes para archivar/eliminar varias a la vez (como "Seleccionar chats" de WhatsApp). */
  public modoSeleccion = false;
  public filtro = '';

  private dialog = inject(MatDialog);
  private lista = inject(MensajesListaService);

  constructor() {
    this.displaySections();

    this.paginationService.change({ pageIndex: 0, pageSize: 20, length: 0 });
    this.formGroup = this.formBuilder.group({});

    this.leerRuta();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.leerRuta());

    this.getConversaciones();

    // Lo que hago en el chat de la derecha (enviar, leer, archivar, silenciar) se refleja en la lista.
    this.lista.cambio$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.getConversaciones());

    // Mensaje nuevo (o enviado desde otra pestaña): refresca la bandeja sin recargar la página.
    this.signalrService.mensaje$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.getConversaciones());

    // Confirmación de lectura en vivo: el ✓ pasa a ✓✓ "Visto" sin recargar la bandeja.
    this.signalrService.mensajesLeidos$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
      for (const c of this.conversaciones) {
        if (c.esMio && c.otro?.id === p?.porId) {
          c.leido = true;
          c.fechaLeido = p.fecha ?? new Date().toISOString();
        }
      }
    });
  }

  verCarpeta(archivadas: boolean): void {
    if (this.archivadas === archivadas) return;
    this.archivadas = archivadas;
    this.conversaciones = [];
    this.paginationService.change({ pageIndex: 0, pageSize: this.paginationService.pageCount, length: 0 });
    this.getConversaciones();
  }

  /** Archiva (o, en Archivadas, devuelve a la bandeja) las seleccionadas, o la fila indicada. */
  archivar(fila?: ConversacionFila): void {
    const ids = fila ? [fila.otro.id] : this.conversaciones.filter((c) => c.selected).map((c) => c.otro.id);
    if (!ids.length) return;
    const archivar = !this.archivadas;

    this.mensajesService.archivarConversaciones(ids, archivar).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok) => {
      if (!ok) return;
      this.notificationService.success(
        archivar
          ? `${ids.length === 1 ? 'Conversación archivada' : ids.length + ' conversaciones archivadas'}. Vuelven a la bandeja si te escriben.`
          : 'De vuelta en la bandeja de entrada',
        archivar ? 'Archivada' : 'Desarchivada',
      );
      this.getConversaciones();
    });
  }

  /** Silenciar: sin aviso ni contador para esa conversación (el otro no se entera). */
  silenciar(fila: ConversacionFila): void {
    const silenciar = !fila.silenciada;
    this.mensajesService.silenciarConversacion(fila.otro.id, silenciar).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok) => {
      if (!ok) return;
      fila.silenciada = silenciar;
      this.badgeService.refresh();
      this.notificationService.success(
        silenciar ? `No te avisaremos de los mensajes de @${fila.otro.userName}` : `Vuelves a recibir avisos de @${fila.otro.userName}`,
        silenciar ? 'Silenciada' : 'Avisos activados',
      );
    });
  }

  /** "Foto" si el último mensaje es solo una imagen. */
  vistaPrevia(c: ConversacionFila): string {
    const texto = this.preview(c.contenido);
    if (texto) return texto;
    const n = c.cantidadImagenes ?? 0;
    if (n > 0 || /<img/i.test(c.contenido ?? '')) return n > 1 ? `${n} fotos` : 'Foto';
    return '';
  }

  esSoloImagen(c: ConversacionFila): boolean {
    return !this.preview(c.contenido) && ((c.cantidadImagenes ?? 0) > 0 || /<img/i.test(c.contenido ?? ''));
  }

  ngOnInit(): void {}

  get selectedCount(): number {
    return this.conversaciones.filter((c) => c.selected).length;
  }

  get unreadCount(): number {
    return this.conversaciones.reduce((total: number, c) => total + (c.noLeidos ?? 0), 0);
  }

  get allSelected(): boolean {
    return this.conversaciones.length > 0 && this.selectedCount === this.conversaciones.length;
  }

  get someSelected(): boolean {
    return this.selectedCount > 0 && !this.allSelected;
  }

  toggleAll(checked: boolean): void {
    this.conversaciones.forEach((c) => (c.selected = checked));
  }

  /** El enlace navega solo; aquí se baja el contador al momento (el API los marca leídos al abrir). */
  abrir(conversacion: ConversacionFila, event?: MouseEvent): void {
    if (this.modoSeleccion) {
      event?.preventDefault();
      conversacion.selected = !conversacion.selected;
      return;
    }
    conversacion.noLeidos = 0;
  }

  alternarSeleccion(): void {
    this.modoSeleccion = !this.modoSeleccion;
    if (!this.modoSeleccion) this.toggleAll(false);
  }

  enviarMP(): void {
    this.dialog.open(DialogEnviarMPComponent, { width: '780px', disableClose: true, data: {} });
  }

  /** Conversaciones de la página filtradas por el buscador (usuario o texto del último mensaje). */
  get visibles(): ConversacionFila[] {
    const q = this.filtro.trim().toLowerCase();
    if (!q) return this.conversaciones;
    return this.conversaciones.filter(
      (c) => c.otro.userName.toLowerCase().includes(q) || this.vistaPrevia(c).toLowerCase().includes(q),
    );
  }

  private leerRuta(): void {
    const ruta = this.router.parseUrl(this.router.url).root.children['primary']?.segments.map((s) => s.path) ?? [];
    this.chatAbierto = ruta.length > 1;
    this.activo = ruta[1] === 'chat' && ruta[2] ? decodeURIComponent(ruta[2]) : null;
  }

  // Vista previa en texto plano: el contenido es HTML y truncarlo cortaría etiquetas a la mitad.
  preview(html: string, max = 140): string {
    if (!html) {
      return '';
    }

    const texto = (new DOMParser().parseFromString(html, 'text/html').body.textContent || '')
      .replace(/\s+/g, ' ')
      .trim();

    return texto.length > max ? texto.substring(0, max).trimEnd() + '…' : texto;
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

  getConversaciones(): void {
    // Conserva la selección al refrescar por tiempo real.
    const seleccionados = new Set(this.conversaciones.filter((c) => c.selected).map((c) => c.otro.id));

    this.mensajesService.getConversaciones(this.archivadas).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.conversaciones = (response?.conversaciones ?? []).map((c) => ({
        ...c,
        selected: seleccionados.has(c.otro?.id),
      }));
      this.totalCount = response?.pagination?.totalCount ?? 0;
      this.totalArchivadas = response?.archivadas ?? 0;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getConversaciones();
  }

  deleteConversaciones(): void {
    const ids = this.conversaciones.filter((c) => c.selected).map((c) => c.otro.id);

    if (!ids || ids.length < 1) {
      return;
    }

    this.mensajesService.deleteConversaciones(ids).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.notificationService.success('Las conversaciones seleccionadas han sido eliminadas', 'Eliminadas');

        this.getConversaciones();
      }
    });
  }
}
