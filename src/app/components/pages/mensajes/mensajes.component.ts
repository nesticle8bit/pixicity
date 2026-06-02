import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-mensajes',
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.scss'],
})
export class MensajesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public mensajes: any[] = [];
  public totalCount: number = 0;

  constructor(
    private displayService: DisplayComponentService,
    private mensajesService: IHttpMensajesService,
    public paginationService: PaginationService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.displaySections();

    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
    this.formGroup = this.formBuilder.group({});

    this.getMensajes();
  }

  ngOnInit(): void {}

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
    this.mensajesService.getMensajes({}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.mensajes = response?.mensajes;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  getMensajesEnviados(): void {
    this.mensajesService.getMensajesEnviados({}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.mensajes = response?.mensajes;
      this.totalCount = response?.pagination?.totalCount;
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
