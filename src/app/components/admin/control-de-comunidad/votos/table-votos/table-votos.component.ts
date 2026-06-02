import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  standalone: false,
  selector: 'app-table-votos',
  templateUrl: './table-votos.component.html',
  styleUrls: ['./table-votos.component.scss'],
})
export class TableVotosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public votos: any[] = [];
  public totalCount: number = 0;

  constructor(
    public paginationService: PaginationService,
    private postService: IHttpPostsService
  ) {
    this.paginationService.change({ pageIndex: 0, pageSize: 25, length: 0 });
  }

  ngOnInit(): void {
    this.getVotos();
  }

  getVotos(): void {
    this.postService.getVotos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.votos = response.data;
      this.totalCount = response.pagination.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getVotos();
  }
}
