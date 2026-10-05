import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SignalrService } from 'src/app/services/shared/signalr.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-mensajes',
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.scss'],
})
export class MensajesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public conversaciones: any[] = [];
  public totalCount: number = 0;

  constructor(
    private displayService: DisplayComponentService,
    private mensajesService: IHttpMensajesService,
    public paginationService: PaginationService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private signalrService: SignalrService,
    private router: Router
  ) {
    this.displaySections();

    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
    this.formGroup = this.formBuilder.group({});

    this.getConversaciones();

    // Mensaje nuevo (o enviado desde otra pestaña): refresca la bandeja sin recargar la página.
    this.signalrService.mensaje$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.getConversaciones());
  }

  ngOnInit(): void {}

  get selectedCount(): number {
    return this.conversaciones.filter((c: any) => c.selected).length;
  }

  get unreadCount(): number {
    return this.conversaciones.reduce((total: number, c: any) => total + (c.noLeidos ?? 0), 0);
  }

  get allSelected(): boolean {
    return this.conversaciones.length > 0 && this.selectedCount === this.conversaciones.length;
  }

  get someSelected(): boolean {
    return this.selectedCount > 0 && !this.allSelected;
  }

  toggleAll(checked: boolean): void {
    this.conversaciones.forEach((c: any) => (c.selected = checked));
  }

  abrir(conversacion: any): void {
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
    const seleccionados = new Set(this.conversaciones.filter((c: any) => c.selected).map((c: any) => c.otro.id));

    this.mensajesService.getConversaciones().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.conversaciones = (response?.conversaciones ?? []).map((c: any) => ({
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
    const ids = this.conversaciones.filter((c: any) => c.selected).map((c: any) => c.otro.id);

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
