import { IHttpLogsService } from 'src/app/services/interfaces/httpLogs.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { PageEvent } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss'],
})
export class MonitorComponent implements OnInit {
  public formGroup: FormGroup;
  public notificaciones: any[] = [];
  public totalCount: number = 0;

  constructor(
    private displayService: DisplayComponentService,
    public paginationService: PaginationService,
    private logsService: IHttpLogsService,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      favorito: true,
      comentarios: true,
      puntos: true,
      seguidores: true,
      postNuevo: true,
      recomendaciones: true,
      comentariosPostQueSigue: true,
    });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: ''
    });
  }

  ngOnInit(): void {
    this.getNotificaciones();
  }

  getNotificaciones(search: string = ''): void {
    this.logsService.getNotificaciones(search).subscribe((response: any) => {
      this.notificaciones = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getNotificaciones();
  }

  filtrarActividad(): void {
    let search = '';

    for (const field in this.formGroup.controls) {
      const control = this.formGroup.get(field) as FormControl;
      search += `&${field}=${control.value}`;
    }

    this.getNotificaciones(search);
  }
}
