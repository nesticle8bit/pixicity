import { PaginationService } from 'src/app/services/shared/pagination.service';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';

@Component({
  selector: 'app-mensajes',
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.scss'],
})
export class MensajesComponent implements OnInit {
  public formGroup: FormGroup;
  public mensajes: any[] = [];
  public totalCount: number = 0;

  constructor(
    private mensajesService: IHttpMensajesService,
    public paginationService: PaginationService,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.getMensajes();
  }

  getMensajes(): void {
    this.mensajesService.getMensajes({}).subscribe((response: any) => {
      this.mensajes = response?.mensajes;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getMensajes();
  }
}
