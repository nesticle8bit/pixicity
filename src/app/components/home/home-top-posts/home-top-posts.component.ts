import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { TopPostModel } from 'src/app/models/web/topPost.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TopTimesSelectorComponent } from '../../sections/top-times-selector/top-times-selector.component';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
    selector: 'app-home-top-posts',
    templateUrl: './home-top-posts.component.html',
    styleUrls: ['./home-top-posts.component.scss'],
    imports: [
        TopTimesSelectorComponent,
        NgClass,
        RouterLink,
        MatTooltip,
        TruncatePipe,
    ],
})
export class HomeTopPostsComponent implements OnInit {
  private httpWeb = inject(IHttpWebService);

  private readonly destroyRef = inject(DestroyRef);

  public date: string = '';
  public loading: boolean = false;
  public topPosts: TopPostModel[] = [];

  ngOnInit(): void {
    this.getTopPosts();
  }

  getTopPosts(): void {
    this.loading = true;

    this.httpWeb
      .getTopPosts(this.date)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: TopPostModel[]) => {
        this.topPosts = value;
        this.loading = false;
      });
  }

  dateChanges(date: string): void {
    if (!date) {
      return;
    }

    this.date = date;
    this.getTopPosts();
  }
}
