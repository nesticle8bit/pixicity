import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IHttpLogsService } from 'src/app/services/interfaces/httpLogs.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnInit {
  public notificaciones: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private logsService: IHttpLogsService
  ) { }

  ngOnInit(): void {
    this.getNotificaciones();
  }

  getNotificaciones(): void {
    this.logsService.getNotificaciones().subscribe((response: any) => {
      this.notificaciones = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getNotificaciones();
  }
}
