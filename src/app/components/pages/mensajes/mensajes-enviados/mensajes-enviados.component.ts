import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-mensajes-enviados',
  templateUrl: './mensajes-enviados.component.html',
  styleUrls: ['./mensajes-enviados.component.scss'],
})
export class MensajesEnviadosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public mensajes: any[] = [];
  public totalCount: number = 0;

  constructor(
    private displayService: DisplayComponentService,
    private mensajesService: IHttpMensajesService,
    public paginationService: PaginationService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.displaySections();

    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
    this.formGroup = this.formBuilder.group({});

    this.getMensajes();
  }

  ngOnInit(): void {}

  abrir(mensaje: any): void {
    this.router.navigate(['/mensajes/conversacion', mensaje.id]);
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

  getMensajes(): void {
    this.mensajesService.getMensajesEnviados({}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.mensajes = response?.mensajes ?? [];
      this.totalCount = response?.pagination?.totalCount ?? 0;
    });
  }

  getMensajesEnviados(): void {
    this.mensajesService.getMensajesEnviados({}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.mensajes = response?.mensajes ?? [];
      this.totalCount = response?.pagination?.totalCount ?? 0;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getMensajes();
  }

  deleteMensajes(): void {
    const ids = this.mensajes
      .filter((mensaje: any) => mensaje.selected)
      .map((mensaje: any) => mensaje.id);

    if (!ids || ids.length < 1) {
      return;
    }

    this.mensajesService.deleteMensajesById(ids).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      if (response) {
        this.notificationService.success('Los mensajes seleccionados han sido eliminados', 'Eliminados');

        this.getMensajes();
      }
    });
  }
}
