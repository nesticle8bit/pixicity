import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { Router, RouterLink } from '@angular/router';
import { ConversacionFila } from 'src/app/models/mensajes/mensaje-vm.model';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { MensajesSidebarComponent } from './mensajes-sidebar/mensajes-sidebar.component';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-mensajes',
    templateUrl: './mensajes.component.html',
    styleUrls: ['./mensajes.component.scss'],
    imports: [
        MatCheckbox,
        MatButton,
        MatTooltip,
        FormsModule,
        UserAvatarComponent,
        RouterLink,
        UserPopoverDirective,
        MatPaginator,
        MensajesSidebarComponent,
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

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public conversaciones: ConversacionFila[] = [];
  public totalCount: number = 0;

  constructor() {
    this.displaySections();

    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
    this.formGroup = this.formBuilder.group({});

    this.getConversaciones();

    // Mensaje nuevo (o enviado desde otra pestaña): refresca la bandeja sin recargar la página.
    this.signalrService.mensaje$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.getConversaciones());
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

  abrir(conversacion: ConversacionFila): void {
    this.router.navigate(['/mensajes/chat', conversacion.otro.userName]);
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

    this.mensajesService.getConversaciones().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.conversaciones = (response?.conversaciones ?? []).map((c) => ({
        ...c,
        selected: seleccionados.has(c.otro?.id),
      }));
      this.totalCount = response?.pagination?.totalCount ?? 0;
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
