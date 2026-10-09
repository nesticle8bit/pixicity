import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { IHttpComentariosPostService } from '../../../services/interfaces/httpComentariosPost.interface';

@Component({
    selector: 'app-profile-comments',
    templateUrl: './profile-comments.component.html',
    styleUrls: ['./profile-comments.component.scss'],
    imports: [
        MatTooltip,
        RouterLink,
        MatPaginator,
        TimeAgoPipe,
        TruncatePipe,
    ],
})
export class ProfileCommentsComponent implements OnInit {
  paginationService = inject(PaginationService);
  private comentariosPostService = inject(IHttpComentariosPostService);

  private readonly destroyRef = inject(DestroyRef);

  private _user: any;

  @Input() set user(value: any) {
    this._user = value;

    if (value) {
      this.getCommentsByUserId();
    }
  }

  get user(): any {
    return this._user;
  }

  public comments: any[] = [];
  public totalCount: number = 0;

  constructor() {
    this.paginationService.change({ pageIndex: 0, pageSize: 10, length: 0 });
  }

  ngOnInit(): void {}

  getCommentsByUserId(): void {
    this.comentariosPostService.getComentariosByUserId(this.user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.comments = response?.data;
      this.totalCount = response?.pagination?.totalCount;
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getCommentsByUserId();
  }
}
