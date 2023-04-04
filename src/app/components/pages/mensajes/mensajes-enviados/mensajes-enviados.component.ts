import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mensajes-enviados',
  templateUrl: './mensajes-enviados.component.html',
  styleUrls: ['./mensajes-enviados.component.scss'],
})
export class MensajesEnviadosComponent implements OnInit {
  public formGroup: FormGroup;
  public mensajes: any[] = [];
  public totalCount: number = 0;

  constructor(
    private displayService: DisplayComponentService,
    private mensajesService: IHttpMensajesService,
    public paginationService: PaginationService,
    private formBuilder: FormBuilder
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
    this.mensajesService.getMensajesEnviados({}).subscribe((response: any) => {
      this.mensajes = response?.mensajes;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  getMensajesEnviados(): void {
    this.mensajesService.getMensajesEnviados({}).subscribe((response: any) => {
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

    this.mensajesService.deleteMensajesById(ids).subscribe((response: any) => {
      if (response) {
        Swal.fire({
          title: 'Eliminados',
          text: 'Los mensajes seleccionados han sido eliminados',
          icon: 'success',
        });

        this.getMensajes();
      }
    });
  }
}
